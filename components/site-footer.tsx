"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";
import { buildPlanCheckoutPath } from "@/lib/commerce";

export function SiteFooter() {
  const { language } = useAppState();
  const tr = language === "tr";

  return (
    <footer className="site-footer">
      <div className="page-shell site-footer-grid">
        <div className="card site-footer-brand">
          <span className="eyebrow">{tr ? "SpeakAce AI" : "SpeakAce AI"}</span>
          <h2 style={{ margin: "0.8rem 0 0.4rem" }}>
            {tr ? "IELTS ve TOEFL speaking pratiği için daha akıllı çalışma alanı." : "A smarter place to practice IELTS and TOEFL speaking."}
          </h2>
          <p className="practice-copy" style={{ marginBottom: "1rem" }}>
            {tr
              ? "SEO odaklı kaynaklar, speaking practice akışı, transcript incelemesi ve Plus planıyla daha güçlü günlük gelişim."
              : "Built with SEO-focused resources, speaking practice flows, transcript review, and a paid plan for stronger daily progress."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/practice">
              {tr ? "Practice başlat" : "Start practice"}
            </Link>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: "LAUNCH20", campaign: "footer_cta" })}>
              {tr ? "Plus aç" : "Unlock Plus"}
            </a>
          </div>
        </div>

        <div className="card site-footer-links">
          <strong>{tr ? "Ürün" : "Product"}</strong>
          <Link href="/pricing">Pricing</Link>
          <Link href="/app/practice">Practice</Link>
          <Link href="/app/billing">{tr ? "Ödeme" : "Billing"}</Link>
          <Link href="/auth">{tr ? "Giriş" : "Sign in"}</Link>
        </div>

        <div className="card site-footer-links">
          <strong>{tr ? "Kaynaklar" : "Resources"}</strong>
          <Link href="/resources">Resources</Link>
          <Link href="/free-ielts-speaking-test">{tr ? "Ucretsiz test" : "Free test"}</Link>
          <Link href="/daily-ielts-speaking-prompt">{tr ? "Gunluk prompt" : "Daily prompt"}</Link>
          <Link href="/weekly-ielts-speaking-challenge">{tr ? "Haftalik challenge" : "Weekly challenge"}</Link>
          <Link href="/ielts-speaking-topics">IELTS topics</Link>
          <Link href="/tools">{tr ? "Araclar" : "Tools"}</Link>
          <Link href="/compare">{tr ? "Karsilastirmalar" : "Compare"}</Link>
          <Link href="/guides">{tr ? "Rehberler" : "Guides"}</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/reviews">{tr ? "Yorumlar" : "Reviews"}</Link>
          <Link href="/case-studies">{tr ? "Ornekler" : "Case studies"}</Link>
          <Link href="/ielts-band-score-guide">Band score guide</Link>
        </div>

        <div className="card site-footer-links">
          <strong>{tr ? "Kullanım alanları" : "Use cases"}</strong>
          <Link href="/for-teachers">{tr ? "Öğretmenler için" : "For teachers"}</Link>
          <Link href="/for-schools">{tr ? "Kurumlar için" : "For schools"}</Link>
          <Link href="/teacher-demo">{tr ? "Demo sinif" : "Demo class"}</Link>
          <Link href="/success-stories">{tr ? "Basari hikayeleri" : "Success stories"}</Link>
          <Link href="/ai-english-speaking-practice">AI speaking</Link>
          <Link href="/speaking-test-simulator-ielts">Simulator</Link>
        </div>
      </div>
    </footer>
  );
}
