import { describe, expect, it } from "vitest";
import {
  annualAccessEnd,
  projectBillingEvents,
  type BillingLedgerEvent,
} from "./billing-entitlements";
const now = Date.parse("2026-06-01T00:00:00Z");
function order(
  id = "order-1",
  created = "2026-01-31T12:00:00Z",
  name = "SpeakAce Plus Annual",
): BillingLedgerEvent {
  return {
    id,
    eventName: "order_created",
    plan: "plus",
    billingStatus: "active",
    receivedAt: "2026-05-01T00:00:00Z",
    payloadJson: {
      data: {
        id,
        type: "orders",
        attributes: {
          product_name: name,
          status: "paid",
          created_at: created,
          updated_at: created,
          total: 4999,
        },
      },
    },
  };
}
function subscription(
  eventName = "subscription_created",
  status = "on_trial",
  updated = "2026-05-31T00:00:00Z",
): BillingLedgerEvent {
  return {
    id: eventName,
    eventName,
    plan: "plus",
    billingStatus: status as BillingLedgerEvent["billingStatus"],
    receivedAt: "2026-06-01T00:00:00Z",
    payloadJson: {
      data: {
        id: "sub-1",
        type: "subscriptions",
        attributes: {
          product_name: "SpeakAce Plus",
          variant_name: "Weekly",
          status,
          created_at: "2026-05-31T00:00:00Z",
          updated_at: updated,
          trial_ends_at: "2026-06-03T00:00:00Z",
          ends_at: status === "cancelled" ? "2026-06-10T00:00:00Z" : null,
        },
      },
    },
  };
}
describe("billing entitlement projection", () => {
  it("uses 12 calendar months from purchase, not webhook arrival", () => {
    expect(projectBillingEvents([order()], now)).toMatchObject({
      plan: "plus",
      billingKind: "fixed_duration",
      accessEndsAt: "2027-01-31T12:00:00.000Z",
      trialEndsAt: null,
    });
  });
  it("clamps leap-day expiry without changing the UTC time", () =>
    expect(annualAccessEnd("2024-02-29T12:34:56Z")).toBe(
      "2025-02-28T12:34:56.000Z",
    ));
  it("enforces annual expiry even without another webhook", () =>
    expect(
      projectBillingEvents([order()], Date.parse("2027-01-31T12:00:00Z")),
    ).toMatchObject({ plan: "free", billingStatus: "expired" }));
  it("keeps a weekly trial bounded by its actual trial date", () => {
    expect(projectBillingEvents([subscription()], now)).toMatchObject({
      plan: "plus",
      billingKind: "subscription",
      trialEndsAt: "2026-06-03T00:00:00.000Z",
    });
    expect(
      projectBillingEvents([subscription()], Date.parse("2026-06-04T00:00:00Z"))
        ?.plan,
    ).toBe("free");
  });
  it("a paid renewal clears the old trial boundary", () => {
    const paid = subscription(
      "subscription_updated",
      "active",
      "2026-06-04T00:00:00Z",
    );
    expect(
      projectBillingEvents(
        [paid, subscription()],
        Date.parse("2026-06-05T00:00:00Z"),
      ),
    ).toMatchObject({
      plan: "plus",
      billingStatus: "active",
      trialEndsAt: null,
      accessEndsAt: null,
    });
  });
  it("uses cancellation ends_at rather than a stale trial date", () => {
    const cancelled = subscription(
      "subscription_cancelled",
      "cancelled",
      "2026-06-04T00:00:00Z",
    );
    expect(
      projectBillingEvents(
        [cancelled, subscription()],
        Date.parse("2026-06-05T00:00:00Z"),
      ),
    ).toMatchObject({
      plan: "plus",
      trialEndsAt: null,
      accessEndsAt: "2026-06-10T00:00:00.000Z",
    });
    expect(
      projectBillingEvents([cancelled], Date.parse("2026-06-11T00:00:00Z"))
        ?.plan,
    ).toBe("free");
  });
  it("does not shorten another independent purchase when older events arrive late", () => {
    const later = order("order-2", "2026-04-01T00:00:00Z");
    expect(
      projectBillingEvents([later, order(), order()], now)?.accessEndsAt,
    ).toBe("2027-04-01T00:00:00.000Z");
  });
  it("revokes a full refund without revoking another paid purchase", () => {
    const refund = {
      ...order(),
      id: "refund",
      eventName: "order_refunded",
      billingStatus: "refunded" as const,
      payloadJson: {
        data: {
          id: "order-1",
          type: "orders",
          attributes: {
            product_name: "SpeakAce Plus Annual",
            status: "refunded",
            refunded: true,
            created_at: "2026-01-31T12:00:00Z",
            updated_at: "2026-05-20T00:00:00Z",
          },
        },
      },
    };
    expect(projectBillingEvents([refund, order()], now)?.plan).toBe("free");
    expect(
      projectBillingEvents(
        [refund, order(), order("order-2", "2026-04-01T00:00:00Z")],
        now,
      )?.plan,
    ).toBe("plus");
  });
  it("does not revoke access for a partial refund", () => {
    const partial = {
      ...order(),
      id: "partial",
      eventName: "order_refunded",
      billingStatus: "refunded" as const,
      payloadJson: {
        data: {
          id: "order-1",
          type: "orders",
          attributes: {
            product_name: "SpeakAce Plus Annual",
            status: "partial_refund",
            total: 4999,
            refunded_amount: 100,
            created_at: "2026-01-31T12:00:00Z",
            updated_at: "2026-05-20T00:00:00Z",
          },
        },
      },
    };
    expect(projectBillingEvents([order(), partial], now)?.plan).toBe("plus");
  });
  it("distinguishes Lifetime from Annual and revokes a fully refunded Lifetime order", () => {
    const lifetime = {
      ...order("life", "2026-01-01T00:00:00Z", "SpeakAce Lifetime"),
      plan: "lifetime" as const,
    };
    expect(
      projectBillingEvents(
        [lifetime, order()],
        Date.parse("2030-01-01T00:00:00Z"),
      ),
    ).toMatchObject({
      plan: "lifetime",
      billingKind: "lifetime",
      accessEndsAt: null,
    });
    const refund = {
      ...lifetime,
      id: "life-refund",
      eventName: "order_refunded",
      billingStatus: "refunded" as const,
      payloadJson: {
        data: {
          id: "life",
          type: "orders",
          attributes: {
            product_name: "SpeakAce Lifetime",
            status: "refunded",
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-05-20T00:00:00Z",
          },
        },
      },
    };
    expect(projectBillingEvents([lifetime, refund], now)?.plan).toBe("free");
  });
  it("does not derive a duration or upgrade from buyer-controlled custom metadata", () => {
    const weekly = order(
      "weekly",
      "2026-01-31T12:00:00Z",
      "SpeakAce Plus Weekly",
    );
    (weekly.payloadJson as Record<string, unknown>).meta = {
      custom_data: { plan: "lifetime", billing: "annual" },
    };
    expect(projectBillingEvents([weekly], now)).toBeNull();
  });
  it("does not grant an unbounded trial from a zero-dollar invoice", () => {
    const invoice: BillingLedgerEvent = {
      id: "invoice",
      eventName: "subscription_payment_success",
      plan: "plus",
      billingStatus: "on_trial",
      receivedAt: "2026-06-01T00:00:00Z",
      payloadJson: {
        data: {
          id: "invoice-1",
          type: "subscription-invoices",
          attributes: {
            subscription_id: "sub-1",
            subtotal_usd: 399,
            total: 0,
            billing_reason: "initial",
            created_at: "2026-05-31T00:00:00Z",
          },
        },
      },
    };
    expect(projectBillingEvents([invoice], now)).toBeNull();
    expect(
      projectBillingEvents([invoice, subscription()], now)?.trialEndsAt,
    ).toBe("2026-06-03T00:00:00.000Z");
  });
  it("does not grant indefinite access for a cancellation missing its boundary", () => {
    const cancelled = subscription("subscription_cancelled", "cancelled");
    (
      cancelled.payloadJson as { data: { attributes: Record<string, unknown> } }
    ).data.attributes.ends_at = null;
    expect(projectBillingEvents([cancelled], now)?.plan).toBe("free");
  });
  it("orders provider revisions within the same millisecond before status tie-breaking", () => {
    const cancelled = subscription(
      "subscription_cancelled",
      "cancelled",
      "2026-06-04T00:00:00.000100Z",
    );
    const resumed = subscription(
      "subscription_resumed",
      "active",
      "2026-06-04T00:00:00.000200Z",
    );
    expect(
      projectBillingEvents(
        [resumed, cancelled],
        Date.parse("2026-06-11T00:00:00Z"),
      ),
    ).toMatchObject({
      plan: "plus",
      billingStatus: "active",
      accessEndsAt: null,
    });
  });
  it("revokes a known purchase when a full refund omits repeated product metadata", () => {
    const refund:BillingLedgerEvent = {id:"minimal-refund",eventName:"order_refunded",plan:"free",billingStatus:"refunded",receivedAt:"2026-05-21T00:00:00Z",payloadJson:{data:{id:"order-1",type:"orders",attributes:{status:"refunded",refunded:true,updated_at:"2026-05-20T00:00:00Z"}}}};
    expect(projectBillingEvents([refund,order()],now)).toMatchObject({plan:"free",billingStatus:"refunded",billingKind:"fixed_duration"});
  });

});
