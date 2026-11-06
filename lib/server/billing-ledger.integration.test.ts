import { createHash } from "node:crypto";
import postgres from "postgres";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  ingestBillingLedgerEvent,
  resolveBillingForMember,
  type BillingIngestion,
} from "./billing-ledger";
import {
  getMember,
  getMemberByEmail,
  getActiveBillingPlanForEmail,
} from "@/lib/store";
import { getLemonEventId } from "./lemon";
import { billingPayload } from "@/lib/billing-entitlements";
import { getAuthenticatedUser } from "./auth";

const url = process.env.BILLING_TEST_DATABASE_URL;
let sql: ReturnType<typeof postgres>;
function event(
  id = "order-1",
  created = new Date().toISOString(),
): BillingIngestion {
  return {
    id: `event:${id}`,
    provider: "lemonsqueezy",
    eventName: "order_created",
    userEmail: "buyer@example.test",
    userId: "buyer",
    plan: "plus",
    billingStatus: "active",
    payloadJson: {
      data: {
        id,
        type: "orders",
        attributes: {
          product_name: "SpeakAce Plus Annual",
          status: "paid",
          created_at: created,
          updated_at: created,
          total: 4999,
          currency: "USD",
        },
      },
    },
  };
}
describe.skipIf(!url)("isolated PostgreSQL billing ledger", () => {
  beforeAll(async () => {
    const target = new URL(url!);
    if (
      !["127.0.0.1", "localhost"].includes(target.hostname) ||
      target.pathname !== "/speakace_regression"
    )
      throw new Error(
        "Billing integration tests require the isolated local speakace_regression database.",
      );
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-06T00:00:00Z"));
    vi.stubEnv("DATABASE_URL", url!);
    sql = postgres(url!, { ssl: false, max: 4, prepare: false });
    globalThis.__speakAceSql = sql;
    await sql.unsafe(`create table if not exists users(id text primary key,email text unique not null,name text not null default 'Test',role text not null default 'member',member_type text not null default 'student',organization_name text,organization_id text,plan text not null default 'free',billing_status text default 'free',lemon_customer_id text,lemon_subscription_id text,trial_ends_at timestamptz,referral_code_used text,email_verified boolean default true,admin_access boolean default false,teacher_access boolean default false,created_at timestamptz default now());
  create table if not exists billing_events(id text primary key,provider text not null,event_name text not null,user_email text,user_id text references users(id),plan text not null,billing_status text not null,provider_customer_id text,provider_subscription_id text,payload_json jsonb not null,created_at timestamptz not null default now());
  create table if not exists auth_sessions(token_hash text primary key,user_id text references users(id),expires_at timestamptz not null);`);
  });
  beforeEach(async () => {
    await sql`truncate billing_events,auth_sessions,users cascade`;
    await sql`insert into users(id,email) values ('buyer','buyer@example.test')`;
  });
  afterAll(async () => {
    if (sql) await sql.end();
    delete globalThis.__speakAceSql;
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });
  it("atomically activates an annual purchase and exposes its explicit expiry", async () => {
    const result = await ingestBillingLedgerEvent(event());
    expect(result.inserted).toBe(true);
    const member = await getMember("buyer");
    expect(member).toMatchObject({
      plan: "plus",
      billingKind: "fixed_duration",
      trialEndsAt: null,
    });
    expect(member?.accessEndsAt).toBeTruthy();
    const cached =
      await sql`select plan,trial_ends_at from users where id='buyer'`;
    expect(cached[0].plan).toBe("plus");
    expect(cached[0].trial_ends_at).toBeNull();
  });
  it("serializes concurrent duplicate deliveries into one grant and ledger row", async () => {
    const input = event();
    const results = await Promise.all([
      ingestBillingLedgerEvent(input),
      ingestBillingLedgerEvent(input),
    ]);
    expect(results.filter((r) => r.inserted)).toHaveLength(1);
    expect(await sql`select id from billing_events`).toHaveLength(1);
  });
  it("rolls back the audit row when entitlement-cache persistence fails, and permits a retry", async () => {
    await sql.unsafe(
      `create or replace function reject_test_billing() returns trigger language plpgsql as $$begin raise exception 'synthetic write failure'; end;$$;create trigger reject_test_billing before update on users for each row execute function reject_test_billing();`,
    );
    try {
      await expect(ingestBillingLedgerEvent(event())).rejects.toThrow(
        "synthetic write failure",
      );
      expect(await sql`select id from billing_events`).toHaveLength(0);
    } finally {
      await sql.unsafe(
        "drop trigger reject_test_billing on users;drop function reject_test_billing();",
      );
    }
    expect((await ingestBillingLedgerEvent(event())).inserted).toBe(true);
  });
  it("enforces expired annual access at every member/auth read without rewriting a customer record", async () => {
    await ingestBillingLedgerEvent(event("old", "2020-01-01T00:00:00Z"));
    await sql`update users set plan='plus',billing_status='active' where id='buyer'`;
    const token = "synthetic-token";
    await sql`insert into auth_sessions values (${createHash("sha256").update(token).digest("hex")},'buyer',now()+interval '1 hour')`;
    expect((await getMember("buyer"))?.plan).toBe("free");
    expect((await getMemberByEmail("BUYER@example.test"))?.plan).toBe("free");
    expect((await getAuthenticatedUser(token))?.plan).toBe("free");
    expect((await sql`select plan from users where id='buyer'`)[0].plan).toBe(
      "plus",
    );
  });
  it("honors provider event order rather than delivery order, including refunds", async () => {
    const original = event("refund-order", "2026-01-01T00:00:00Z");
    const refunded = {
      ...original,
      id: "refund-event",
      eventName: "order_refunded",
      plan: "free" as const,
      billingStatus: "refunded" as const,
      payloadJson: {
        data: {
          id: "refund-order",
          type: "orders",
          attributes: {
            product_name: "SpeakAce Plus Annual",
            status: "refunded",
            refunded: true,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-02-01T00:00:00Z",
          },
        },
      },
    };
    await ingestBillingLedgerEvent(refunded);
    await ingestBillingLedgerEvent(original);
    expect((await getMember("buyer"))?.plan).toBe("free");
    expect(await getActiveBillingPlanForEmail("buyer@example.test")).toBeNull();
  });
  it("claims a pre-registration purchase by verified email and never another account's user id", async () => {
    const input = event();
    input.userId = null;
    input.userEmail = "new@example.test";
    await ingestBillingLedgerEvent(input);
    expect(await getActiveBillingPlanForEmail("new@example.test")).toBe("plus");
    await sql`insert into users(id,email) values ('new','new@example.test')`;
    expect((await getMember("new"))?.plan).toBe("plus");
    const mismatch = { ...event("mismatch"), userEmail: "other@example.test" };
    await expect(ingestBillingLedgerEvent(mismatch)).rejects.toThrow(
      "BILLING_IDENTITY_MISMATCH",
    );
    expect(await getActiveBillingPlanForEmail("other@example.test")).toBeNull();
  });
  it("does not shorten a newer independent annual purchase or leak it to a different email", async () => {
    const newer = event("newer", "2026-10-01T00:00:00Z"),
      older = event("older", "2026-01-01T00:00:00Z");
    await ingestBillingLedgerEvent(newer);
    await ingestBillingLedgerEvent(older);
    expect((await getMember("buyer"))?.accessEndsAt).toBe(
      "2027-10-01T00:00:00.000Z",
    );
    const profile = await getMember("buyer");
    expect(
      (
        await resolveBillingForMember({
          ...profile!,
          id: "different",
          email: "different@example.test",
          plan: "free",
        })
      ).plan,
    ).toBe("free");
  });
  it("recognizes legacy raw-JSON deliveries even when a replay changes formatting", async () => {
    const input = event("legacy");
    await ingestBillingLedgerEvent({
      ...input,
      id: "lemonsqueezy:old-raw-json-hash",
    });
    const stableId = getLemonEventId(billingPayload(input.payloadJson));
    expect(
      (await ingestBillingLedgerEvent({ ...input, id: stableId })).inserted,
    ).toBe(false);
    expect((await sql`select id from billing_events`).length).toBe(1);
  });
  it("preserves manual Lifetime despite stale legacy trial fields and unrelated purchases", async () => {
    await sql`update users set plan='lifetime',billing_status='on_trial',trial_ends_at='2020-01-01' where id='buyer'`;
    await ingestBillingLedgerEvent(event("unrelated-annual"));
    const token="manual-lifetime-token";
    await sql`insert into auth_sessions values (${createHash("sha256").update(token).digest("hex")},'buyer',now()+interval '1 hour')`;
    expect((await getMember("buyer"))?.plan).toBe("lifetime");
    expect((await getMemberByEmail("buyer@example.test"))?.plan).toBe("lifetime");
    expect((await getAuthenticatedUser(token))?.plan).toBe("lifetime");
  });
  it("enforces the known end date of a legacy cancellation even without ledger events", async () => {
    await sql`update users set plan='plus',billing_status='cancelled',trial_ends_at='2020-01-01' where id='buyer'`;
    const token="legacy-cancel-token";
    await sql`insert into auth_sessions values (${createHash("sha256").update(token).digest("hex")},'buyer',now()+interval '1 hour')`;
    expect((await getMember("buyer"))?.plan).toBe("free");
    expect((await getAuthenticatedUser(token))?.plan).toBe("free");
  });

});
