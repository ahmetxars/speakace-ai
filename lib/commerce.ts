export const commerceConfig = {
  plusMonthlyCheckout:
    "https://speakace.lemonsqueezy.com/checkout/buy/b4c5f62b-17a3-4f53-82a1-bed7b2925084",
  plusMonthlyPrice: "$9.99",
  plusPlanName: "SpeakAce Plus Monthly",
  plusCheckoutPath: "/api/payments/lemon/checkout?plan=plus",
  customerPortalUrl: "https://speakace.lemonsqueezy.com/billing",
  launchOfferLabel: "Launch offer",
  launchOfferCopy: "Use LAUNCH20 for an early supporter discount."
} as const;

export const couponCatalog = {
  LAUNCH20: {
    code: "LAUNCH20",
    label: "Launch 20% off",
    description: "For first buyers during the launch phase."
  },
  SPEAKACE10: {
    code: "SPEAKACE10",
    label: "Starter 10% off",
    description: "For visitors who want a smaller first step into Plus."
  }
} as const;

export function buildPlanCheckoutPath(input?: { coupon?: string; campaign?: string }) {
  const params = new URLSearchParams({ plan: "plus" });
  if (input?.coupon) {
    params.set("coupon", input.coupon);
  }
  if (input?.campaign) {
    params.set("campaign", input.campaign);
  }
  return `/api/payments/lemon/checkout?${params.toString()}`;
}

export function buildLemonCheckoutUrl(input?: {
  email?: string;
  name?: string;
  userId?: string;
  coupon?: string;
  campaign?: string;
}) {
  const url = new URL(commerceConfig.plusMonthlyCheckout);
  if (input?.email) {
    url.searchParams.set("checkout[email]", input.email);
  }
  if (input?.name) {
    url.searchParams.set("checkout[name]", input.name);
  }
  if (input?.userId) {
    url.searchParams.set("checkout[custom][user_id]", input.userId);
  }
  if (input?.coupon) {
    url.searchParams.set("discount_code", input.coupon);
    url.searchParams.set("checkout[discount_code]", input.coupon);
  }
  if (input?.campaign) {
    url.searchParams.set("checkout[custom][campaign]", input.campaign);
  }
  return url.toString();
}

export function getPlanComparison(tr: boolean) {
  return [
    {
      label: tr ? "Günlük speaking süresi" : "Daily speaking minutes",
      free: tr ? "8 dakika" : "8 minutes",
      plus: tr ? "35 dakika" : "35 minutes"
    },
    {
      label: tr ? "Günlük oturum" : "Daily sessions",
      free: "4",
      plus: "18"
    },
    {
      label: tr ? "Detaylı geri bildirim" : "Detailed AI feedback",
      free: tr ? "Temel" : "Basic",
      plus: tr ? "Geniş" : "Expanded"
    },
    {
      label: tr ? "Skor ve trend takibi" : "Score and trend tracking",
      free: tr ? "Sınırlı" : "Limited",
      plus: tr ? "Tam erişim" : "Full access"
    }
  ];
}
