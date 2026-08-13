export type BillingRecoveryAttribution = {
  ctaPath?: string | null;
  campaign?: string | null;
  plan?: "plus" | "pro" | "lifetime" | null;
  billing?: "weekly" | "monthly" | "annual" | null;
};

export type CheckoutRecoveryAttribution = BillingRecoveryAttribution & {
  plan: "plus" | "pro" | "lifetime";
  billing: "weekly" | "monthly" | "annual";
  checkoutId: string;
  ctaEvent?: string | null;
  createdAt?: string | null;
};

export const CHECKOUT_ATTRIBUTION_COOKIE = "speakace_checkout_attribution";
export const CHECKOUT_RECOVERY_WINDOW_SECONDS = 60 * 60 * 72;

const checkoutIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeDimension(value: unknown, fallback: string) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, 80) : fallback;
}

export function buildBillingSyncPendingPath(attribution: BillingRecoveryAttribution | null | undefined) {
  const plan = attribution?.plan === "plus" || attribution?.plan === "pro" || attribution?.plan === "lifetime"
    ? attribution.plan
    : "unknown";
  const billing = plan !== "unknown" && (
    attribution?.billing === "weekly" || attribution?.billing === "monthly" || attribution?.billing === "annual"
  )
    ? attribution.billing
    : "unknown";
  const params = new URLSearchParams({
    plan,
    billing,
    source: normalizeDimension(attribution?.ctaPath, "unknown")
  });

  if (typeof attribution?.campaign === "string" && attribution.campaign.trim()) {
    params.set("campaign", normalizeDimension(attribution.campaign, "unknown"));
  }

  return `/app/billing/success/pending?${params.toString()}`;
}

function normalizeOptionalDimension(value: unknown, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeCheckoutBilling(plan: CheckoutRecoveryAttribution["plan"], value: unknown) {
  if (plan === "plus") return value === "annual" ? "annual" : "weekly";
  if (plan === "pro") return value === "annual" ? "annual" : "monthly";
  return "weekly";
}

export function parseCheckoutRecoveryAttribution(rawValue: string | null | undefined, now = Date.now()) {
  if (!rawValue) return null;

  let decodedValue = rawValue;
  try {
    decodedValue = decodeURIComponent(rawValue);
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(decodedValue) as Record<string, unknown>;
    const plan = parsed.plan === "plus" || parsed.plan === "pro" || parsed.plan === "lifetime"
      ? parsed.plan
      : null;
    const checkoutId = typeof parsed.checkoutId === "string" && checkoutIdPattern.test(parsed.checkoutId)
      ? parsed.checkoutId
      : null;

    if (!plan || !checkoutId) return null;

    const createdAt = normalizeOptionalDimension(parsed.createdAt, 40);
    if (createdAt) {
      const createdAtMs = new Date(createdAt).getTime();
      const maxAgeMs = CHECKOUT_RECOVERY_WINDOW_SECONDS * 1000;
      if (!Number.isFinite(createdAtMs) || createdAtMs > now + 5 * 60 * 1000 || now - createdAtMs > maxAgeMs) {
        return null;
      }
    }

    return {
      plan,
      billing: normalizeCheckoutBilling(plan, parsed.billing),
      checkoutId,
      campaign: normalizeOptionalDimension(parsed.campaign, 80),
      ctaPath: normalizeOptionalDimension(parsed.ctaPath, 240),
      ctaEvent: normalizeOptionalDimension(parsed.ctaEvent, 80),
      createdAt
    } satisfies CheckoutRecoveryAttribution;
  } catch {
    return null;
  }
}

export function buildCheckoutRecoveryPath(
  attribution: CheckoutRecoveryAttribution,
  currentPath: string | null | undefined
) {
  const safePath = typeof currentPath === "string" && currentPath.startsWith("/")
    ? currentPath.slice(0, 200)
    : "/";
  const params = new URLSearchParams({
    plan: attribution.plan,
    billing: attribution.billing,
    checkout_id: attribution.checkoutId,
    campaign: "checkout_recovery",
    cta: `${safePath === "/" ? "" : safePath}/checkout-recovery`,
    cta_event: "checkout_recovery_continued"
  });

  return `/api/payments/lemon/checkout?${params.toString()}`;
}
