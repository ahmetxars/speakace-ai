"use client";

import { usePathname } from "next/navigation";
import { commerceConfig, couponCatalog, buildPlanCheckoutPath } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export function MarketingStickyCta() {
  const pathname = usePathname();
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";

  if (!pathname) return null;
  if (pathname.startsWith("/app") || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;
  if (!(pathname === "/pricing" || pathname.startsWith("/blog"))) return null;
  if (signedIn && currentUser?.plan && currentUser.plan !== "free") return null;
  const isPricingPage = pathname === "/pricing";

  return (
    <div className="marketing-sticky-cta">
      <div className="marketing-sticky-copy">
        <strong>{tr ? "Plus ile daha hızlı geliş" : "Grow faster with Plus"}</strong>
        <span>
          {isPricingPage
            ? tr
              ? `${commerceConfig.plusMonthlyPrice} · ${couponCatalog.LAUNCH20.code} ile erken destekçi indirimi`
              : `${commerceConfig.plusMonthlyPrice} · early supporter offer with ${couponCatalog.LAUNCH20.code}`
            : tr
              ? `${commerceConfig.plusMonthlyPrice} · Tam geri bildirim ve daha fazla speaking oturumu`
              : `${commerceConfig.plusMonthlyPrice} · Full feedback and more speaking sessions`}
        </span>
      </div>
      <a
        className="button button-primary"
        href={
          isPricingPage
            ? buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "sticky_cta" })
            : buildPlanCheckoutPath({ campaign: "sticky_cta" })
        }
      >
        {tr ? "Plus'i ac" : "Unlock Plus"}
      </a>
    </div>
  );
}
