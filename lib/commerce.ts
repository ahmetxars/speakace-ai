export const commerceConfig = {
  plusMonthlyCheckout:
    "https://speakace.lemonsqueezy.com/checkout/buy/95ae8a51-fe50-4b27-a9e3-767db738b374",
  plusMonthlyPrice: "$9.99",
  plusPlanName: "SpeakAce Plus Monthly",
  plusCheckoutPath: "/api/payments/lemon/checkout?plan=plus",
  customerPortalUrl: "https://speakace.lemonsqueezy.com/billing"
} as const;

export function buildLemonCheckoutUrl(input?: { email?: string; name?: string; userId?: string }) {
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
