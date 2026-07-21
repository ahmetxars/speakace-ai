"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buildPlanCheckoutPath, couponCatalog } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export function MarketingStickyCta() {
  const pathname = usePathname();
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 520);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [pathname]);

  if (!pathname) return null;
  if (pathname.startsWith("/app") || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/for-") || pathname === "/teacher-demo") return null;
  if (pathname === "/maintenance") return null;
  if (signedIn && currentUser?.plan && currentUser.plan !== "free") return null;
  if (!visible) return null;
  const isPricingPage = pathname === "/pricing";
  const isBlogPage = pathname.startsWith("/blog");
  const ctaHref = isPricingPage
    ? buildPlanCheckoutPath({ plan: "plus", coupon: couponCatalog.LAUNCH20.code, campaign: "sticky_pricing_weekly" })
    : "/free-ielts-speaking-test";

  return (
    <div className="marketing-sticky-cta">
      <div className="marketing-sticky-copy">
        <strong>
          {isPricingPage
            ? tr
              ? "3 gunluk Plus denemesini baslat"
              : "Start the 3-day Plus trial"
            : tr
              ? "Ücretsiz speaking testi ile başla"
              : "Start with a free speaking test"}
        </strong>
        <span>
          {isPricingPage
            ? tr
              ? `Deneme sonrasinda haftalik $3.99; ilk checkout icin ${couponCatalog.LAUNCH20.code} kullanabilirsin`
              : `Then $3.99/week; use ${couponCatalog.LAUNCH20.code} on your first checkout`
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
        {isPricingPage ? (tr ? "Denemeyi baslat" : "Start trial") : (tr ? "Ucretsiz testi baslat" : "Start Free Test")}
      </a>
    </div>
  );
}
