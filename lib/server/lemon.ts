import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { commerceNumbers } from "@/lib/commerce";
import type { BillingStatus, SubscriptionPlan } from "@/lib/types";

type LemonPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    type?: string;
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

export function verifyLemonSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(digest, "utf8");
  const right = Buffer.from(signature, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function getLemonEventName(payload: LemonPayload) {
  return String(payload.meta?.event_name ?? "");
}

export function getLemonEmail(payload: LemonPayload) {
  const attributes = payload.data?.attributes ?? {};
  const email =
    attributes.user_email ??
    attributes.customer_email ??
    attributes.email;

  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

export function getLemonUserId(payload: LemonPayload) {
  const customData = payload.meta?.custom_data ?? {};
  const userId = customData.user_id ?? customData.userid;
  return typeof userId === "string" || typeof userId === "number" ? String(userId) : null;
}

function lemonDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
export function getLemonTrialEndsAt(payload: LemonPayload) {
  return lemonDate(payload.data?.attributes?.trial_ends_at);
}
export function getLemonAccessEndsAt(payload: LemonPayload) {
  const attributes = payload.data?.attributes ?? {};
  return ["cancelled", "expired"].includes(String(attributes.status ?? ""))
    ? lemonDate(attributes.ends_at)
    : attributes.status === "on_trial" ? lemonDate(attributes.trial_ends_at) : null;
}

export function getLemonCheckoutMetadata(payload: LemonPayload) {
  const customData = payload.meta?.custom_data ?? {};
  const stringValue = (value: unknown) => typeof value === "string" && value.trim() ? value : null;

  return {
    checkoutId: stringValue(customData.checkout_id),
    visitorId: stringValue(customData.visitor_id),
    campaign: stringValue(customData.campaign),
    ctaPath: stringValue(customData.cta_path),
    ctaEvent: stringValue(customData.cta_event)
  };
}

export function getLemonPaymentDetails(payload: LemonPayload) {
  const attributes = payload.data?.attributes ?? {};
  const rawTotal = attributes.total;
  const totalInCents = typeof rawTotal === "number" ? rawTotal : typeof rawTotal === "string" ? Number(rawTotal) : NaN;
  const rawCurrency = attributes.currency;
  const currency = typeof rawCurrency === "string" && rawCurrency.trim() ? rawCurrency.toUpperCase() : null;
  const rawOrderId = attributes.identifier ?? attributes.order_id ?? payload.data?.id;
  const orderId = typeof rawOrderId === "string" || typeof rawOrderId === "number" ? String(rawOrderId) : null;

  return {
    orderId,
    value: Number.isFinite(totalInCents) ? Number((totalInCents / 100).toFixed(2)) : null,
    currency
  };
}

export function getLemonCustomerId(payload: LemonPayload) {
  const attributes = (payload.data?.attributes ?? {}) as Record<string, unknown>;
  const firstOrderItem =
    attributes.first_order_item && typeof attributes.first_order_item === "object"
      ? (attributes.first_order_item as Record<string, unknown>)
      : null;
  const value = attributes.customer_id ?? firstOrderItem?.customer_id;
  return typeof value === "number" || typeof value === "string" ? String(value) : null;
}

export function getLemonSubscriptionId(payload: LemonPayload) {
  const attributes = payload.data?.attributes ?? {};
  const subscriptionId = attributes.subscription_id;
  if (typeof subscriptionId === "string" || typeof subscriptionId === "number") {
    return String(subscriptionId);
  }

  if (payload.data?.type !== "subscriptions") return null;
  const dataId = payload.data?.id;
  return typeof dataId === "string" || typeof dataId === "number" ? String(dataId) : null;
}

export function resolvePlanFromLemonPayload(payload: LemonPayload): Exclude<SubscriptionPlan, "free"> | null {
  const attributes = payload.data?.attributes ?? {};
  const firstOrderItem =
    attributes.first_order_item && typeof attributes.first_order_item === "object"
      ? (attributes.first_order_item as Record<string, unknown>)
      : null;
  const sourceText = [
    attributes.variant_name,
    attributes.product_name,
    attributes.order_item_name,
    firstOrderItem?.variant_name,
    firstOrderItem?.product_name
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\blifetime\b/.test(sourceText)) return "lifetime";
  if (/\bpro\b/.test(sourceText)) return "pro";
  if (/\bplus\b/.test(sourceText)) return "plus";

  const rawSubtotalUsd = attributes.subtotal_usd;
  const rawSubtotal = attributes.subtotal;
  const currency = typeof attributes.currency === "string" ? attributes.currency.toUpperCase() : null;
  const subtotalInCents =
    typeof rawSubtotalUsd === "number"
      ? rawSubtotalUsd
      : typeof rawSubtotalUsd === "string"
        ? Number(rawSubtotalUsd)
        : currency === "USD" && typeof rawSubtotal === "number"
          ? rawSubtotal
          : currency === "USD" && typeof rawSubtotal === "string"
            ? Number(rawSubtotal)
            : NaN;

  if (Number.isFinite(subtotalInCents)) {
    const roundedSubtotal = Math.round(subtotalInCents);
    if ([399, 4900, Math.round(commerceNumbers.plusAnnualPrice * 100)].includes(roundedSubtotal)) {
      return "plus";
    }
    if (
      roundedSubtotal === Math.round(commerceNumbers.proMonthlyPrice * 100) ||
      roundedSubtotal === Math.round(commerceNumbers.proAnnualPrice * 100)
    ) {
      return "pro";
    }
    if ([12999, 14900, Math.round(commerceNumbers.lifetimePrice * 100)].includes(roundedSubtotal)) {
      return "lifetime";
    }
  }

  return null;
}

export function resolveBillingStatusFromEvent(eventName: string, payload: LemonPayload): BillingStatus | null {
  const attributes = payload.data?.attributes ?? {};
  const statusValue = String(attributes.status ?? "").toLowerCase();

  if (["subscription_created", "subscription_resumed", "subscription_unpaused"].includes(eventName)) {
    if (statusValue.includes("trial")) return "on_trial";
    return "active";
  }
  if (["subscription_payment_success", "subscription_payment_recovered"].includes(eventName)) {
    const rawTotal = attributes.total;
    const total = typeof rawTotal === "number" ? rawTotal : typeof rawTotal === "string" ? Number(rawTotal) : NaN;
    if (eventName === "subscription_payment_success" && attributes.billing_reason === "initial" && total === 0) {
      return "on_trial";
    }
    return "active";
  }
  if (eventName === "subscription_updated") {
    if (statusValue.includes("trial")) return "on_trial";
    if (statusValue.includes("past_due") || statusValue.includes("unpaid")) return "past_due";
    if (statusValue.includes("pause")) return "paused";
    if (statusValue.includes("cancel")) return "cancelled";
    if (statusValue.includes("expire")) return "expired";
    return "active";
  }
  if (eventName === "subscription_cancelled") return "cancelled";
  if (eventName === "subscription_paused") return "paused";
  if (eventName === "subscription_expired") return "expired";
  if (eventName === "subscription_payment_failed") return "past_due";
  if (["order_refunded", "subscription_refunded", "subscription_payment_refunded"].includes(eventName)) return "refunded";
  if (eventName === "order_created") return "active";
  return null;
}

export function resolvePlanForStatus(plan: SubscriptionPlan, status: BillingStatus): SubscriptionPlan {
  if (status === "refunded") return "free";
  if (plan === "lifetime") return "lifetime";
  if (status === "expired") return "free";
  return plan;
}

/** Stable provider-object identity; a replay with different JSON formatting is still one event. */
export function getLemonEventId(payload:LemonPayload) {
 const name=getLemonEventName(payload),a=payload.data?.attributes??{};
 const once=name==="order_created" || name==="subscription_created" || (payload.data?.type==="subscription-invoices" && !name.includes("refunded"));
 const identity={name,type:payload.data?.type??"",id:payload.data?.id??"",version:once?"":a.updated_at??a.created_at??null,status:once?"":a.status??null,refunded:once?null:a.refunded_amount??a.refunded??null};
 return `lemonsqueezy:${createHash("sha256").update(JSON.stringify(identity)).digest("hex")}`;
}
