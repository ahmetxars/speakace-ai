import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSchema } from "@/components/marketing-schema";
import { SiteHeader } from "@/components/site-header";
import { buildPlanCheckoutPath, commerceConfig, couponCatalog, getPlanComparison } from "@/lib/commerce";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";

const pricingCopy = {
  en: {
    title: "IELTS Speaking Pricing | Full Feedback and Unlimited Practice",
    description:
      "Compare free and Plus plans for IELTS speaking practice, full feedback, band-style scoring, and more daily speaking time.",
    eyebrow: "Pricing",
    heading: "IELTS speaking practice pricing built around faster score improvement",
    intro:
      "Start free, see your score first, then unlock full feedback, more daily speaking time, and a stronger IELTS scoring workflow.",
    launchOffer: "Launch offer",
    bestFor: "Best for",
    bestForValue: "Daily IELTS score improvement",
    corePromise: "Core promise",
    corePromiseValue: "Full feedback after every speaking attempt",
    price: "Price",
    free: "Free",
    start: "Start Speaking Now",
    faqTitle: "Common buying questions"
  },
  tr: {
    title: "IELTS Speaking Fiyatları | Tam Geri Bildirim ve Sınırsıza Yakın Pratik",
    description:
      "IELTS speaking pratiği için ücretsiz ve Plus planlarını; tam geri bildirim, band benzeri skor ve daha fazla günlük speaking süresiyle karşılaştırın.",
    eyebrow: "Fiyatlar",
    heading: "IELTS speaking pratiği için daha hızlı skor gelişimine uygun fiyatlar",
    intro:
      "Ücretsiz başla, önce skorunu gör, sonra tam geri bildirim, daha fazla günlük speaking süresi ve daha güçlü bir IELTS skorlama akışı aç.",
    launchOffer: "Tanıtım teklifi",
    bestFor: "En uygun kullanım",
    bestForValue: "Günlük IELTS skor gelişimi",
    corePromise: "Ana vaat",
    corePromiseValue: "Her denemeden sonra tam geri bildirim",
    price: "Fiyat",
    free: "Ücretsiz",
    start: "Konuşmaya başla",
    faqTitle: "Sık sorulan satın alma soruları"
  }
} as const;

function getPricingCopy(language: Language) {
  return ((pricingCopy as unknown) as Partial<Record<Language, (typeof pricingCopy)["en"]>>)[language] ?? pricingCopy.en;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getPricingCopy(language);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: "/pricing"
    }
  };
}

export default async function PricingPage() {
  const language = await getServerLanguage();
  const copy = getPricingCopy(language);
  const comparison = getPlanComparison(language === "tr");
  const faq = [
    {
      q: "How is Plus different from free?",
      a: "Plus increases your daily volume, gives deeper transcript and score insight, and makes retry-based improvement much easier."
    },
    {
      q: "Is this a subscription?",
      a: "Yes. SpeakAce Plus is a monthly plan built for learners who want more daily speaking practice and faster progress."
    },
    {
      q: "Who should buy Plus?",
      a: "Students preparing seriously for IELTS or TOEFL speaking, especially if they want a stronger daily feedback loop."
    }
  ];

  return (
    <>
      <MarketingSchema />
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            {copy.heading}
          </h1>
          <p>{copy.intro}</p>
        </div>

        <div className="stats-strip">
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.launchOffer}</div>
            <strong>{couponCatalog.LAUNCH20.code}</strong>
          </div>
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.bestFor}</div>
            <strong>{copy.bestForValue}</strong>
          </div>
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.corePromise}</div>
            <strong>{copy.corePromiseValue}</strong>
          </div>
          <div className="card stat-strip-card">
            <div className="practice-meta">{copy.price}</div>
            <strong>{commerceConfig.plusMonthlyPrice}/month</strong>
          </div>
        </div>

        <div className="marketing-grid">
          <article className="card pricing-card">
            <h3>{copy.free}</h3>
            <div className="price-tag">$0</div>
            <ul>
              <li>4 daily speaking sessions</li>
              <li>8 daily speaking minutes</li>
              <li>Starter score view and limited feedback</li>
            </ul>
            <Link className="button button-secondary" href="/auth">
              {copy.start}
            </Link>
          </article>

          <article className="card pricing-card" data-featured="true">
            <h3>{commerceConfig.plusPlanName}</h3>
            <div className="price-tag">{commerceConfig.plusMonthlyPrice}</div>
            <ul>
              <li>18 daily sessions</li>
              <li>35 daily speaking minutes</li>
              <li>Full feedback after each speaking attempt</li>
              <li>Expanded IELTS-style score insight</li>
              <li>Unlimited-feeling retry and improvement workflow</li>
              <li>Built for serious exam score growth</li>
            </ul>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "pricing_hero" })}>
              Unlock full feedback
            </a>
            <div className="practice-meta">Try coupon: {couponCatalog.LAUNCH20.code}</div>
          </article>
        </div>

        <div className="marketing-grid">
          {Object.values(couponCatalog).map((coupon) => (
            <article key={coupon.code} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Launch coupon</div>
              <h3>{coupon.label}</h3>
              <p>{coupon.description}</p>
              <a className="button button-secondary" href={buildPlanCheckoutPath({ coupon: coupon.code, campaign: "pricing_coupon" })}>
                Use {coupon.code}
              </a>
            </article>
          ))}
        </div>

        <div className="marketing-grid">
          {[
            {
              title: "What students pay for",
              description:
                "Not just AI output. They pay for a faster loop: speak, score, fix mistakes, retry, and track score movement without waiting."
            },
            {
              title: "Why teachers like the product",
              description:
                "The same plan lets teachers show visible score movement while students keep practicing between lessons."
            },
            {
              title: "Why Plus converts better than a generic plan",
              description:
                "It is tied to clear outcomes: more speaking, more feedback, stronger scoring insight, and less friction."
            }
          ].map((item) => (
            <article key={item.title} className="card testimonial-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
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

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Why Plus pays for itself</h3>
            <p>One private lesson can cost more than a full month of repeatable speaking practice, scoring, and feedback.</p>
          </article>
          <article className="card feature-card">
            <h3>Built for score movement</h3>
            <p>Plus is not only more usage. It is a better score-improvement loop: more attempts, deeper review, stronger retries, and clearer progress tracking.</p>
          </article>
          <article className="card feature-card">
            <h3>Start free, upgrade when ready</h3>
            <p>The free plan is enough to see your score and try the workflow. Plus is there when you want full feedback and more daily volume.</p>
          </article>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <span className="eyebrow">FAQ</span>
          <h2 style={{ margin: 0 }}>{copy.faqTitle}</h2>
          <div className="marketing-grid">
            {faq.map((item) => (
              <article key={item.q} className="card feature-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">After purchase</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Already paid? Check your Plus status.</h2>
            <p className="practice-copy">
              If your plan does not refresh instantly, the billing success screen can re-check your
              plan and pull the new status into your account.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/billing/success">
              Open billing status
            </Link>
            <a className="button button-secondary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "pricing_bottom" })}>
              Buy Plus
            </a>
            <Link className="button button-secondary" href="/reviews">
              Read reviews
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
