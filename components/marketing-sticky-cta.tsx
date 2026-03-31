"use client";

import { usePathname } from "next/navigation";
import { commerceConfig, couponCatalog, buildPlanCheckoutPath } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export function MarketingStickyCta() {
  const pathname = usePathname();
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";

  if (!pathname) return null;
  if (pathname.startsWith("/app") || pathname.startsWith("/auth")) return null;
  if (signedIn && currentUser?.plan && currentUser.plan !== "free") return null;

  return (
    <div className="marketing-sticky-cta">
      <div className="marketing-sticky-copy">
        <strong>{tr ? "Plus ile daha hizli gelis" : "Grow faster with Plus"}</strong>
        <span>
          {tr
            ? `${commerceConfig.plusMonthlyPrice} · ${couponCatalog.LAUNCH20.code} ile erken destekci indirimi`
            : `${commerceConfig.plusMonthlyPrice} · early supporter offer with ${couponCatalog.LAUNCH20.code}`}
        </span>
      </div>
      <a
        className="button button-primary"
        href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "sticky_cta" })}
      >
        {tr ? "Plus'i ac" : "Unlock Plus"}
      </a>
    </div>
  );
}
