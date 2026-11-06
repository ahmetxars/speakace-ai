import {
  getLemonCustomerId,
  getLemonSubscriptionId,
  resolvePlanFromLemonPayload,
} from "@/lib/server/lemon";
import type {
  BillingStatus,
  MemberProfile,
  SubscriptionPlan,
} from "@/lib/types";

export type BillingKind = "subscription" | "fixed_duration" | "lifetime";
export type BillingLedgerEvent = {
  id: string;
  eventName: string;
  plan: SubscriptionPlan;
  billingStatus: BillingStatus;
  payloadJson: unknown;
  receivedAt: string;
};
export type BillingProjection = Pick<
  MemberProfile,
  | "plan"
  | "billingStatus"
  | "trialEndsAt"
  | "lemonCustomerId"
  | "lemonSubscriptionId"
> & {
  accessEndsAt: string | null;
  billingKind: BillingKind;
};
type Payload = {
  meta?: { custom_data?: Record<string, unknown> };
  data?: { id?: string; type?: string; attributes?: Record<string, unknown> };
};
type Grant = BillingProjection & { key: string; timestamp: number };
export function billingPayload(value: unknown): Payload {
  if (typeof value === "string") {
    try {
      return billingPayload(JSON.parse(value));
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" ? (value as Payload) : {};
}
export function billingDate(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}
/** Calendar months from purchase, clamped at the last day for leap-day purchases. */
export function annualAccessEnd(purchasedAt: string): string {
  const date = new Date(purchasedAt),
    day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 12);
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.toISOString();
}
export function isFullBillingRefund(payload: Payload) {
  const a = payload.data?.attributes ?? {};
  return (
    a.refunded === true ||
    a.status === "refunded" ||
    (Number(a.total) > 0 && Number(a.refunded_amount) >= Number(a.total))
  );
}
function merchantNames(payload: Payload) {
  const a = payload.data?.attributes ?? {};
  const item =
    a.first_order_item && typeof a.first_order_item === "object"
      ? (a.first_order_item as Record<string, unknown>)
      : {};
  return [
    a.product_name,
    a.variant_name,
    a.order_item_name,
    item.product_name,
    item.variant_name,
  ]
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();
}
function priority(status: BillingStatus) {
  return {
    free: 0,
    active: 1,
    on_trial: 2,
    past_due: 3,
    paused: 4,
    cancelled: 5,
    expired: 6,
    refunded: 7,
  }[status];
}

/** Preserve provider sub-millisecond revisions; Date alone truncates them. */
function providerRevision(value: unknown, fallback: string): bigint {
  const raw =
    typeof value === "string" && billingDate(value) ? value : fallback;
  const millis = Date.parse(raw);
  if (!Number.isFinite(millis)) return BigInt(0);
  const fraction = raw.match(/\.(\d+)(?:Z|[+-]\d{2}:?\d{2})$/)?.[1] ?? "";
  return (
    BigInt(millis) * BigInt(1000000) +
    BigInt(fraction.padEnd(9, "0").slice(3, 9))
  );
}

/** Project independent purchases using provider time, never delivery order or client checkout metadata. */
export function projectBillingEvents(
  events: BillingLedgerEvent[],
  now = Date.now(),
): BillingProjection | null {
  const normalized = events
    .map((event) => ({ event, payload: billingPayload(event.payloadJson) }))
    .filter((x) => x.payload.meta?.custom_data?.type !== "institution");
  const orderSubscriptions = new Map<string, string>();
  for (const { payload } of normalized) {
    const a = payload.data?.attributes ?? {};
    if (
      payload.data?.type === "subscriptions" &&
      a.order_id &&
      payload.data?.id
    )
      orderSubscriptions.set(String(a.order_id), payload.data.id);
  }
  const sorted = normalized.sort((x, y) => {
    const time = (v: typeof x) =>
      providerRevision(
        v.payload.data?.attributes?.updated_at ??
          v.payload.data?.attributes?.created_at,
        v.event.receivedAt,
      );
    const left = time(x),
      right = time(y);
    return (
      (left < right ? -1 : left > right ? 1 : 0) ||
      priority(x.event.billingStatus) - priority(y.event.billingStatus) ||
      x.event.id.localeCompare(y.event.id)
    );
  });
  const grants = new Map<string, Grant>();
  for (const { event, payload } of sorted) {
    const a = payload.data?.attributes ?? {},
      type = payload.data?.type,
      id = payload.data?.id;
    if (!id) continue;
    let subscriptionId = getLemonSubscriptionId(payload);
    if (type === "orders" && isFullBillingRefund(payload))
      subscriptionId = orderSubscriptions.get(id) ?? subscriptionId;
    const key = subscriptionId
      ? `subscription:${subscriptionId}`
      : `order:${id}`;
    const prior = grants.get(key),
      names = merchantNames(payload);
    const resolved = resolvePlanFromLemonPayload(payload);
    const plan =
      resolved ??
      prior?.plan ??
      (type === "subscription-invoices" ? event.plan : null);
    if (!plan || plan === "free") continue;
    const occurred =
      billingDate(a.updated_at) ??
      billingDate(a.created_at) ??
      billingDate(event.receivedAt);
    if (!occurred) continue;
    const refund = event.eventName.includes("refunded");
    if (refund && !isFullBillingRefund(payload)) continue;
    let kind: BillingKind;
    if (subscriptionId) kind = "subscription";
    else if (plan === "lifetime" && /\blifetime\b/.test(names))
      kind = "lifetime";
    else if (plan === "plus" && /\bannual\b|\byearly\b/.test(names))
      kind = "fixed_duration";
    else if (refund && prior) kind = prior.billingKind;
    else continue; // An initial weekly order is not proof of an active subscription or its trial dates.
    if (type === "orders" && !refund && a.status && a.status !== "paid")
      continue;
    // A refund cannot be undone by an unrelated subscription metadata snapshot.
    if (
      prior?.billingStatus === "refunded" &&
      !refund &&
      ![
        "subscription_payment_success",
        "subscription_payment_recovered",
      ].includes(event.eventName)
    )
      continue;
    let status: BillingStatus = refund ? "refunded" : event.billingStatus;
    const purchase = billingDate(a.created_at);
    const stored = (
      payload as Payload & { _speakace_entitlement?: { accessEndsAt?: string } }
    )._speakace_entitlement;
    let accessEndsAt =
      kind === "fixed_duration"
        ? (billingDate(stored?.accessEndsAt) ??
          (purchase
            ? annualAccessEnd(purchase)
            : (prior?.accessEndsAt ?? null)))
        : null;
    if (kind === "fixed_duration" && !accessEndsAt) continue; // Never invent an annual start date from the arrival time.
    const trialEndsAt =
      kind === "subscription" && status === "on_trial"
        ? (billingDate(a.trial_ends_at) ?? prior?.trialEndsAt ?? null)
        : null;
    if (kind === "subscription" && status === "on_trial" && !trialEndsAt)
      continue;
    if (kind === "subscription" && status === "cancelled")
      accessEndsAt = billingDate(a.ends_at) ?? prior?.accessEndsAt ?? null;
    if (kind === "subscription" && status === "cancelled" && !accessEndsAt)
      status = "expired";
    if (kind === "subscription" && status === "on_trial")
      accessEndsAt = trialEndsAt;
    if (
      accessEndsAt &&
      Date.parse(accessEndsAt) <= now &&
      !["refunded", "expired"].includes(status)
    )
      status = "expired";
    grants.set(key, {
      key,
      plan,
      billingStatus: status,
      billingKind: kind,
      trialEndsAt,
      accessEndsAt,
      lemonCustomerId:
        getLemonCustomerId(payload) ?? prior?.lemonCustomerId ?? null,
      lemonSubscriptionId: subscriptionId,
      timestamp: Date.parse(occurred),
    });
  }
  if (!grants.size) return null;
  const alive = [...grants.values()].filter(
    (g) =>
      !["free", "expired", "refunded", "paused"].includes(
        g.billingStatus ?? "free",
      ),
  );
  const ranks: Record<SubscriptionPlan, number> = {
    free: 0,
    plus: 1,
    pro: 2,
    lifetime: 3,
  };
  alive.sort(
    (a, b) =>
      ranks[b.plan] - ranks[a.plan] ||
      (b.accessEndsAt ? Date.parse(b.accessEndsAt) : Infinity) -
        (a.accessEndsAt ? Date.parse(a.accessEndsAt) : Infinity) ||
      b.timestamp - a.timestamp,
  );
  const chosen =
    alive[0] ??
    [...grants.values()].sort((a, b) => b.timestamp - a.timestamp)[0];
  return {
    plan: alive.length ? chosen.plan : "free",
    billingStatus: chosen.billingStatus,
    billingKind: chosen.billingKind,
    accessEndsAt: chosen.accessEndsAt,
    trialEndsAt: chosen.trialEndsAt,
    lemonCustomerId: chosen.lemonCustomerId,
    lemonSubscriptionId: chosen.lemonSubscriptionId,
  };
}
