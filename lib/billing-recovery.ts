export type BillingRecoveryAttribution = {
  ctaPath?: string | null;
  campaign?: string | null;
  plan?: "plus" | "pro" | "lifetime" | null;
  billing?: "weekly" | "annual" | null;
};

function normalizeDimension(value: unknown, fallback: string) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, 80) : fallback;
}

export function buildBillingSyncPendingPath(attribution: BillingRecoveryAttribution | null | undefined) {
  const plan = attribution?.plan === "plus" || attribution?.plan === "pro" || attribution?.plan === "lifetime"
    ? attribution.plan
    : "unknown";
  const billing = attribution?.billing === "weekly" || attribution?.billing === "annual"
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
