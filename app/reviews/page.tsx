import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseUnit } from "@/components/adsense-unit";
import { TrackedLink } from "@/components/tracked-link";
import { buildPlanCheckoutPath, commerceNumbers, formatUsd, getAnnualMonthlyEquivalent } from "@/lib/commerce";
import { siteConfig } from "@/lib/site";

const reviewGroups = [
  {
    title: "For learners targeting a higher band",
    points: [
      "The transcript view makes it easier to see where the answer lost structure.",
      "Retrying the same prompt turns vague feedback into a specific revision.",
      "Short AI practice can support, but does not replace, lessons or official assessment."
    ]
  },
  {
    title: "Teachers and small schools",
    points: [
      "The class workflow is useful between lessons when students need extra speaking practice.",
      "Homework and replay give a clearer picture of who is progressing and who is stalling.",
      "Students can record and review independently before the next live lesson."
    ]
  },
  {
    title: "Self-study learners",
    points: [
      "Daily speaking becomes more realistic when the feedback loop is short.",
      "A stronger sample answer shows how a response can be developed.",
      "The dashboard keeps the next task visible instead of leaving practice to guesswork."
    ]
  }
];

export const metadata: Metadata = {
  title: "Review SpeakAce by Use Case",
  description:
    "Review SpeakAce features for IELTS and TOEFL self-study, band improvement, and teacher workflows before choosing a plan.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Review SpeakAce by Use Case",
    description:
      "Inspect SpeakAce workflows for self-study learners and teachers without anonymous testimonial claims.",
    url: `${siteConfig.domain}/reviews`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function ReviewsPage() {
  const plusAnnualMonthlyEquivalent = getAnnualMonthlyEquivalent(commerceNumbers.plusAnnualPrice);

  return (
    <>
      <main className="page-shell section reviews-page">
        <div className="section-head">
          <span className="eyebrow">Product review</span>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 0.95 }}>
            Review the workflow with your own result, not anonymous hype.
          </h1>
          <p>
            SpeakAce is built for learners who want a faster record-review-retry loop, and for
            teachers who want more visibility between lessons.
          </p>
        </div>

        <div className="reviews-grid">
          {reviewGroups.map((group) => (
            <article key={group.title} className="card testimonial-card">
              <h2 style={{ marginTop: 0 }}>{group.title}</h2>
              <ul className="compact-list">
                {group.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <AdSenseUnit />

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Try the same workflow on your own answers.</h2>
            <p className="practice-copy">
              Start with a free speaking session or unlock Plus to get more daily minutes, deeper
              transcript review, and a cleaner improvement loop. The annual option brings the monthly
              equivalent down to about {formatUsd(plusAnnualMonthlyEquivalent)}.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/practice">
              Start free practice
            </Link>
            <TrackedLink className="button button-primary" href={buildPlanCheckoutPath({ plan: "plus", billing: "annual", campaign: "reviews_annual" })}>
              Best value: Plus annual
            </TrackedLink>
            <TrackedLink className="button button-secondary" href={buildPlanCheckoutPath({ plan: "plus", campaign: "reviews_weekly" })}>
              Unlock Plus weekly
            </TrackedLink>
          </div>
        </div>
      </main>
    </>
  );
}
