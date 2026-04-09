export const commerceConfig = {
  plusMonthlyCheckout:
    "https://speakace.lemonsqueezy.com/checkout/buy/b4c5f62b-17a3-4f53-82a1-bed7b2925084",
  plusMonthlyPrice: "$3.99",
  plusPlanName: "SpeakAce Plus Weekly",
  plusCheckoutPath: "/api/payments/lemon/checkout?plan=plus",
  // Pro plan — configure LEMON_SQUEEZY_PRO_CHECKOUT_URL in your environment
  proMonthlyCheckout:
    process.env.LEMON_SQUEEZY_PRO_CHECKOUT_URL ??
    "https://speakace.lemonsqueezy.com/checkout/buy/pro-plan-placeholder",
  proMonthlyPrice: "$12",
  proPlanName: "SpeakAce Pro",
  proCheckoutPath: "/api/payments/lemon/checkout?plan=pro",
  // Annual plans — configure via LEMON_SQUEEZY_PLUS_ANNUAL_CHECKOUT_URL and LEMON_SQUEEZY_PRO_ANNUAL_CHECKOUT_URL
  plusAnnualCheckout:
    process.env.LEMON_SQUEEZY_PLUS_ANNUAL_CHECKOUT_URL ??
    "https://speakace.lemonsqueezy.com/checkout/buy/b4c5f62b-17a3-4f53-82a1-bed7b2925084",
  plusAnnualPrice: "$49",
  proAnnualCheckout:
    process.env.LEMON_SQUEEZY_PRO_ANNUAL_CHECKOUT_URL ??
    "https://speakace.lemonsqueezy.com/checkout/buy/pro-plan-placeholder",
  proAnnualPrice: "$99",
  // Institution plans — configure via LEMON_SQUEEZY_INSTITUTION_* env variables
  institutionStarterCheckout:
    process.env.LEMON_SQUEEZY_INSTITUTION_STARTER_URL ??
    "https://speakace.lemonsqueezy.com/checkout/buy/institution-starter-placeholder",
  institutionTeamCheckout:
    process.env.LEMON_SQUEEZY_INSTITUTION_TEAM_URL ??
    "https://speakace.lemonsqueezy.com/checkout/buy/institution-team-placeholder",
  institutionCampusCheckout:
    process.env.LEMON_SQUEEZY_INSTITUTION_CAMPUS_URL ??
    "https://speakace.lemonsqueezy.com/checkout/buy/institution-campus-placeholder",
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

export function buildPlanCheckoutPath(input?: { plan?: "plus" | "pro"; coupon?: string; campaign?: string; billing?: "weekly" | "annual" }) {
  const plan = input?.plan ?? "plus";
  const params = new URLSearchParams({ plan });
  if (input?.coupon) {
    params.set("coupon", input.coupon);
  }
  if (input?.campaign) {
    params.set("campaign", input.campaign);
  }
  if (input?.billing === "annual") {
    params.set("billing", "annual");
  }
  return `/api/payments/lemon/checkout?${params.toString()}`;
}

export function buildLemonCheckoutUrl(input?: {
  plan?: "plus" | "pro";
  billing?: "weekly" | "annual";
  email?: string;
  name?: string;
  userId?: string;
  coupon?: string;
  campaign?: string;
}) {
  let baseCheckout: string;
  if (input?.plan === "pro") {
    baseCheckout = input.billing === "annual" ? commerceConfig.proAnnualCheckout : commerceConfig.proMonthlyCheckout;
  } else {
    baseCheckout = input?.billing === "annual" ? commerceConfig.plusAnnualCheckout : commerceConfig.plusMonthlyCheckout;
  }
  const url = new URL(baseCheckout);
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

export function buildInstitutionCheckoutUrl(input: {
  plan: "starter" | "team" | "campus";
  email?: string;
  name?: string;
  userId?: string;
  seatCount?: number;
}) {
  let baseCheckout: string;
  if (input.plan === "campus") baseCheckout = commerceConfig.institutionCampusCheckout;
  else if (input.plan === "team") baseCheckout = commerceConfig.institutionTeamCheckout;
  else baseCheckout = commerceConfig.institutionStarterCheckout;

  const url = new URL(baseCheckout);
  if (input.email) url.searchParams.set("checkout[email]", input.email);
  if (input.name) url.searchParams.set("checkout[name]", input.name);
  if (input.userId) url.searchParams.set("checkout[custom][user_id]", input.userId);
  if (input.plan) url.searchParams.set("checkout[custom][plan]", input.plan);
  if (input.seatCount) url.searchParams.set("checkout[custom][seat_count]", String(input.seatCount));
  url.searchParams.set("checkout[custom][type]", "institution");
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
