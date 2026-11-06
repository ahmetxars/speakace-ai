import {
  getLemonEventId,
  resolvePlanFromLemonPayload,
} from "@/lib/server/lemon";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import {
  billingPayload,
  projectBillingEvents,
  type BillingLedgerEvent,
} from "@/lib/billing-entitlements";
import type { BillingStatus, MemberProfile } from "@/lib/types";
import type { Sql } from "postgres";

type Connection = Sql;
export type BillingIngestion = {
  id: string;
  legacyId?: string;
  provider: "lemonsqueezy";
  eventName: string;
  userEmail?: string | null;
  userId?: string | null;
  plan: MemberProfile["plan"];
  billingStatus: BillingStatus;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  payloadJson: unknown;
};
type StoredEvent = BillingLedgerEvent & {
  userId: string | null;
  userEmail: string | null;
};
function memoryEvents() {
  const root = globalThis as typeof globalThis & {
    __speakAceBillingLedger?: Map<string, StoredEvent>;
  };
  return (
    root.__speakAceBillingLedger ?? (root.__speakAceBillingLedger = new Map())
  );
}
export function resetBillingLedgerMemory() {
  memoryEvents().clear();
}
async function eventsFor(sql: Connection, id: string | null, email: string) {
  return sql<
    BillingLedgerEvent[]
  >`select id, event_name as "eventName", plan, billing_status as "billingStatus", payload_json as "payloadJson", created_at::text as "receivedAt"
 from billing_events where (user_id=${id} and ${id}::text is not null) or (lower(user_email)=${email} and (user_id is null or user_id=${id}))`;
}
export async function billingEventsForIdentity(
  id: string | null,
  email: string,
): Promise<BillingLedgerEvent[]> {
  const normalized = email.trim().toLowerCase();
  if (hasDatabaseUrl()) return eventsFor(getSql(), id, normalized);
  return [...memoryEvents().values()].filter(
    (e) =>
      (id && e.userId === id) ||
      (e.userId === null && e.userEmail === normalized),
  );
}
/** Read-time expiry is authoritative; no customer record is rewritten just by opening a page. */
export async function resolveBillingForMember(
  member: MemberProfile,
): Promise<MemberProfile> {
  const events = await billingEventsForIdentity(member.id, member.email);
  const projection = projectBillingEvents(events);
  if (!projection) return member;
  // Preserve manually granted legacy Lifetime until an actual Lifetime purchase/refund can be reconciled.
  if (
    member.plan === "lifetime" &&
    !events.some(
      (e) =>
        resolvePlanFromLemonPayload(billingPayload(e.payloadJson)) ===
        "lifetime",
    )
  )
    return member;
  return { ...member, ...projection };
}

/** Audit insertion and the cache update commit together; duplicates have no write side effects. */
export async function ingestBillingLedgerEvent(input: BillingIngestion) {
  const email = input.userEmail?.trim().toLowerCase() ?? "";
  const receivedAt = new Date().toISOString();
  const payload = { ...billingPayload(input.payloadJson) };
  delete (payload as Record<string, unknown>)._speakace_entitlement;
  const single = projectBillingEvents([
    {
      id: input.id,
      eventName: input.eventName,
      plan: input.plan,
      billingStatus: input.billingStatus,
      payloadJson: payload,
      receivedAt,
    },
  ]);
  const storedPayload = {
    ...payload,
    ...(single?.billingKind === "fixed_duration"
      ? {
          _speakace_entitlement: {
            version: 1,
            billingKind: "fixed_duration",
            accessEndsAt: single.accessEndsAt,
          },
        }
      : {}),
  };
  if (!hasDatabaseUrl()) {
    const events = memoryEvents();
    if (
      events.has(input.id) ||
      Boolean(input.legacyId && events.has(input.legacyId))
    )
      return { inserted: false, projection: null };
    events.set(input.id, {
      ...input,
      payloadJson: storedPayload,
      receivedAt,
      userId: input.userId ?? null,
      userEmail: email || null,
    });
    return {
      inserted: true,
      projection: projectBillingEvents(
        await billingEventsForIdentity(input.userId ?? null, email),
      ),
    };
  }
  return getSql().begin(async (transaction) => {
    // postgres TransactionSql omits the callable signature in its declaration; runtime is the same SQL tag.
    const sql = transaction as unknown as Sql;
    // Serialize all purchases for an identity, not just deliveries for the same order.
    await sql`select pg_advisory_xact_lock(hashtextextended(${email || input.userId || input.id},0))`;
    const duplicate = await sql<
      Array<{ id: string }>
    >`select id from billing_events where id=${input.id} or id=${input.legacyId ?? input.id} limit 1`;
    if (duplicate.length) return { inserted: false, projection: null };
    const members = await sql<
      Array<{ id: string; email: string; plan: MemberProfile["plan"] }>
    >`select id,email,plan from users where (${input.userId ?? null}::text is not null and id=${input.userId ?? null}) or (${input.userId ?? null}::text is null and lower(email)=${email}) limit 1 for update`;
    const member = members[0];
    if (member && email && member.email.toLowerCase() !== email)
      throw new Error("BILLING_IDENTITY_MISMATCH");
    // Older releases keyed raw JSON; reconcile provider identity before any new write.
    const priorEvents = await eventsFor(
      sql,
      member?.id ?? input.userId ?? null,
      email,
    );
    if (
      priorEvents.some(
        (event) =>
          getLemonEventId(billingPayload(event.payloadJson)) === input.id,
      )
    ) {
      return { inserted: false, projection: null };
    }
    const inserted = await sql<
      Array<{ id: string }>
    >`insert into billing_events (id,provider,event_name,user_email,user_id,plan,billing_status,provider_customer_id,provider_subscription_id,payload_json,created_at)
  values (${input.id},${input.provider},${input.eventName},${email || null},${member?.id ?? input.userId ?? null},${input.plan},${input.billingStatus},${input.providerCustomerId ?? null},${input.providerSubscriptionId ?? null},${sql.json(storedPayload as Parameters<typeof sql.json>[0])},${receivedAt}) on conflict(id) do nothing returning id`;
    if (!inserted.length) return { inserted: false, projection: null };
    const events = await eventsFor(
      sql,
      member?.id ?? input.userId ?? null,
      email,
    );
    const projection = projectBillingEvents(events);
    if (
      member &&
      projection &&
      !(
        member.plan === "lifetime" &&
        !events.some(
          (e) =>
            resolvePlanFromLemonPayload(billingPayload(e.payloadJson)) ===
            "lifetime",
        )
      )
    ) {
      await sql`update users set plan=${projection.plan},billing_status=${projection.billingStatus ?? "free"},trial_ends_at=${projection.trialEndsAt ?? null},lemon_customer_id=coalesce(${projection.lemonCustomerId ?? null},lemon_customer_id),lemon_subscription_id=${projection.lemonSubscriptionId ?? null} where id=${member.id}`;
    }
    return { inserted: true, projection };
  });
}
