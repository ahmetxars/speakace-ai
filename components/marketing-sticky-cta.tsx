"use client";

import { usePathname } from "next/navigation";
import { buildPlanCheckoutPath, commerceNumbers, couponCatalog, formatUsd, getAnnualMonthlyEquivalent } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export function MarketingStickyCta() {
  const pathname = usePathname();
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";
  const annualMonthlyEquivalent = getAnnualMonthlyEquivalent(commerceNumbers.plusAnnualPrice);

  if (!pathname) return null;
  if (pathname.startsWith("/app") || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;
  if (pathname === "/maintenance") return null;
  if (signedIn && currentUser?.plan && currentUser.plan !== "free") return null;
  const isPricingPage = pathname === "/pricing";
  const isBlogPage = pathname.startsWith("/blog");
  const ctaHref = isPricingPage
    ? buildPlanCheckoutPath({ plan: "plus", billing: "annual", coupon: couponCatalog.LAUNCH20.code, campaign: "sticky_pricing_annual" })
    : "/free-ielts-speaking-test";

  return (
    <div className="marketing-sticky-cta">
      <div className="marketing-sticky-copy">
        <strong>
          {isPricingPage
            ? tr
              ? "En iyi deger: Plus yillik"
              : "Best value: Plus annual"
            : tr
              ? "Ücretsiz speaking testi ile başla"
              : "Start with a free speaking test"}
        </strong>
        <span>
          {isPricingPage
            ? tr
              ? `${couponCatalog.LAUNCH20.code} ile yillik Plus'in aylik maliyeti ${formatUsd(annualMonthlyEquivalent)} seviyesine iner`
              : `Use ${couponCatalog.LAUNCH20.code} and bring annual Plus down to about ${formatUsd(annualMonthlyEquivalent)}/month`
            : isBlogPage
              ? tr
                ? "Okuduğun konuyu hemen practice ile dene"
                : "Turn this guide into a real practice attempt now"
              : tr
                ? "Kısa bir test, transcript ve ilk skor sinyali"
                : "One short test, transcript, and your first score signal"}
        </span>
      </div>
      <a
        className="button button-primary"
        href={ctaHref}
      >
        {isPricingPage ? (tr ? "Yillik Plus'i ac" : "Unlock annual Plus") : (tr ? "Start Free Test" : "Start Free Test")}
      </a>
    </div>
  );
}
