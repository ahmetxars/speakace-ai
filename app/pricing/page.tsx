import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { commerceConfig, getPlanComparison } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "SpeakAce Pricing",
  description:
    "See SpeakAce pricing for IELTS and TOEFL speaking practice with AI feedback, transcript review, and speaking score support.",
  alternates: {
    canonical: "/pricing"
  }
};

export default function PricingPage() {
  const comparison = getPlanComparison(false);

  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Pricing</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            IELTS speaking practice pricing that feels easy to try
          </h1>
          <p>
            Start free or unlock SpeakAce Plus for more daily speaking minutes, stronger transcript
            review, and faster score improvement loops.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card pricing-card">
            <h3>Free</h3>
            <div className="price-tag">$0</div>
            <ul>
              <li>4 daily speaking sessions</li>
              <li>8 daily speaking minutes</li>
              <li>Basic transcript and feedback</li>
            </ul>
            <Link className="button button-secondary" href="/auth">
              Create free account
            </Link>
          </article>

          <article className="card pricing-card" data-featured="true">
            <h3>{commerceConfig.plusPlanName}</h3>
            <div className="price-tag">{commerceConfig.plusMonthlyPrice}</div>
            <ul>
              <li>18 daily sessions</li>
              <li>35 daily speaking minutes</li>
              <li>Expanded score and transcript insight</li>
              <li>Better retry and improvement workflow</li>
            </ul>
            <a className="button button-primary" href={commerceConfig.plusCheckoutPath}>
              Buy Plus
            </a>
          </article>
        </div>

        <div className="card comparison-card">
          <h2 style={{ marginBottom: "0.9rem" }}>Free vs Plus</h2>
          <div className="comparison-table">
            <div className="comparison-head">Feature</div>
            <div className="comparison-head">Free</div>
            <div className="comparison-head">Plus</div>
            {comparison.map((item) => (
              <>
                <div key={`${item.label}-label`} className="comparison-cell comparison-label">{item.label}</div>
                <div key={`${item.label}-free`} className="comparison-cell">{item.free}</div>
                <div key={`${item.label}-plus`} className="comparison-cell">{item.plus}</div>
              </>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
