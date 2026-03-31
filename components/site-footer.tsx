"use client";

import Link from "next/link";
import type { Route } from "next";
import { useAppState } from "@/components/providers";
import { buildPlanCheckoutPath } from "@/lib/commerce";

export function SiteFooter() {
  const { language } = useAppState();
  const tr = language === "tr";

  const productLinks = [
    { href: "/pricing" as Route, label: tr ? "Pricing" : "Pricing" },
    { href: "/app/practice" as Route, label: tr ? "Practice" : "Practice" },
    { href: "/app/billing" as Route, label: tr ? "Ödeme" : "Billing" },
    { href: "/auth" as Route, label: tr ? "Giriş" : "Sign in" },
  ];

  const resourceLinks = [
    { href: "/resources" as Route, label: "Resources" },
    { href: "/free-ielts-speaking-test" as Route, label: tr ? "Ucretsiz test" : "Free test" },
    { href: "/daily-ielts-speaking-prompt" as Route, label: tr ? "Gunluk prompt" : "Daily prompt" },
    { href: "/weekly-ielts-speaking-challenge" as Route, label: tr ? "Haftalik challenge" : "Weekly challenge" },
    { href: "/ielts-speaking-topics" as Route, label: "IELTS topics" },
    { href: "/tools" as Route, label: tr ? "Araclar" : "Tools" },
    { href: "/compare" as Route, label: tr ? "Karsilastirmalar" : "Compare" },
    { href: "/guides" as Route, label: tr ? "Rehberler" : "Guides" },
    { href: "/blog" as Route, label: "Blog" },
    { href: "/reviews" as Route, label: tr ? "Yorumlar" : "Reviews" },
    { href: "/case-studies" as Route, label: tr ? "Ornekler" : "Case studies" },
    { href: "/ielts-band-score-guide" as Route, label: "Band score guide" },
  ];

  const useCaseLinks = [
    { href: "/for-teachers" as Route, label: tr ? "Öğretmenler için" : "For teachers" },
    { href: "/for-schools" as Route, label: tr ? "Kurumlar için" : "For schools" },
    { href: "/teacher-demo" as Route, label: tr ? "Demo sinif" : "Demo class" },
    { href: "/success-stories" as Route, label: tr ? "Basari hikayeleri" : "Success stories" },
    { href: "/ai-english-speaking-practice" as Route, label: "AI speaking" },
    { href: "/speaking-test-simulator-ielts" as Route, label: "Simulator" },
  ];

  return (
    <footer className="site-footer">
      <div className="page-shell site-footer-grid">
        <div className="card site-footer-brand">
          <span className="eyebrow">{tr ? "SpeakAce AI" : "SpeakAce AI"}</span>
          <h2 className="site-footer-brand-title">
            {tr ? "IELTS ve TOEFL speaking pratiği için daha sakin ve net bir çalışma alanı." : "A calmer, clearer place to practice IELTS and TOEFL speaking."}
          </h2>
          <p className="practice-copy site-footer-brand-copy">
            {tr
              ? "SEO odaklı kaynaklar, speaking practice akışı, transcript incelemesi ve Plus planıyla daha güçlü günlük gelişim."
              : "Built with SEO-focused resources, speaking practice flows, transcript review, and a paid plan for stronger daily progress."}
          </p>
          <div className="site-footer-brand-actions">
            <Link className="button button-secondary" href="/app/practice">
              {tr ? "Practice başlat" : "Start practice"}
            </Link>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: "LAUNCH20", campaign: "footer_cta" })}>
              {tr ? "Plus aç" : "Unlock Plus"}
            </a>
          </div>
        </div>

        <div className="card site-footer-panel">
          <div className="site-footer-panel-header">
            <strong>{tr ? "Ürün ve kaynaklar" : "Product and resources"}</strong>
            <span>{tr ? "Ana sayfalar, ücretsiz giriş kapıları ve rehberler" : "Core pages, free entry points, and study guides"}</span>
          </div>
          <div className="site-footer-panel-groups">
            <div className="site-footer-link-group">
              <span className="site-footer-group-title">{tr ? "Ürün" : "Product"}</span>
              <div className="site-footer-link-columns site-footer-link-columns-compact">
                {productLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="site-footer-link-group">
              <span className="site-footer-group-title">{tr ? "Kaynaklar" : "Resources"}</span>
              <div className="site-footer-link-columns">
                {resourceLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card site-footer-panel">
          <div className="site-footer-panel-header">
            <strong>{tr ? "Kullanim alanlari" : "Use cases"}</strong>
            <span>{tr ? "Öğretmenler, kurumlar ve yoğun çalışan öğrenciler için" : "For teachers, schools, and focused learners"}</span>
          </div>
          <div className="site-footer-link-columns site-footer-link-columns-compact">
            {useCaseLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
