"use client";

import { usePathname } from "next/navigation";
import { couponCatalog } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export function MarketingStickyCta() {
  const pathname = usePathname();
  const { currentUser, signedIn, language } = useAppState();
  const tr = language === "tr";

  if (!pathname) return null;
  if (pathname.startsWith("/app") || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;
  if (pathname === "/maintenance") return null;
  if (signedIn && currentUser?.plan && currentUser.plan !== "free") return null;
  const isPricingPage = pathname === "/pricing";
  const isBlogPage = pathname.startsWith("/blog");
  const ctaHref = "/free-ielts-speaking-test";

  return (
    <div className="marketing-sticky-cta">
      <div className="marketing-sticky-copy">
        <strong>{tr ? "Ücretsiz speaking testi ile başla" : "Start with a free speaking test"}</strong>
        <span>
          {isPricingPage
            ? tr
              ? `Skorunu önce ücretsiz gör, sonra ${couponCatalog.LAUNCH20.code} ile Plus'a geç`
              : `See your score free first, then upgrade with ${couponCatalog.LAUNCH20.code}`
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
        {tr ? "Start Free Test" : "Start Free Test"}
      </a>
    </div>
  );
}
