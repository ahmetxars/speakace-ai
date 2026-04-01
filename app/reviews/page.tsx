import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

const reviewGroups = [
  {
    title: "Students who need faster score movement",
    points: [
      "The transcript view makes it easier to see where the answer lost structure.",
      "Retrying the same prompt helped me move from vague answers to more direct ones.",
      "It feels lighter than booking repeated mock interviews."
    ]
  },
  {
    title: "Teachers and small schools",
    points: [
      "The class workflow is useful between lessons when students need extra speaking practice.",
      "Homework and replay give a clearer picture of who is progressing and who is stalling.",
      "It is easier to keep students active when they can record and review on their own."
    ]
  },
  {
    title: "Self-study learners",
    points: [
      "Daily speaking becomes more realistic when the feedback loop is short.",
      "Seeing a stronger sample answer helps me understand what a better response sounds like.",
      "The dashboard gives me a reason to come back instead of guessing what to practice."
    ]
  }
];

const reviewTickerItems = [
  {
    quote: "The retry loop helps me hear the difference between a weak answer and a more direct one.",
    author: "IELTS self-study learner",
    role: "Band score improvement focus"
  },
  {
    quote: "I can finally see what to fix next instead of repeating random speaking practice.",
    author: "Daily practice student",
    role: "Fluency and structure"
  },
  {
    quote: "The class workflow makes more sense for schools than using disconnected speaking tools.",
    author: "Language school teacher",
    role: "Homework and follow-up"
  },
  {
    quote: "The transcript review is the part that makes the product feel useful after every attempt.",
    author: "TOEFL learner",
    role: "Transcript and feedback loop"
  },
  {
    quote: "It feels more motivating when I can retry the same topic with a clearer plan.",
    author: "Independent learner",
    role: "Confidence and repetition"
  }
];

export const metadata: Metadata = {
  title: "SpeakAce Reviews",
  description:
    "See why students, teachers, and self-study learners use SpeakAce for IELTS and TOEFL speaking practice.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "SpeakAce Reviews",
    description:
      "Read proof-style reviews about SpeakAce, the AI speaking practice platform for IELTS and TOEFL learners.",
    url: `${siteConfig.domain}/reviews`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function ReviewsPage() {
  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviewGroups.flatMap((group, groupIndex) =>
      group.points.map((point, pointIndex) => ({
        "@type": "Review",
        position: groupIndex * 10 + pointIndex + 1,
        reviewBody: point,
        itemReviewed: {
          "@type": "SoftwareApplication",
          name: siteConfig.name
        }
      }))
    )
  };

  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Reviews</span>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 0.95 }}>
            Social proof that sounds closer to real usage than hype.
          </h1>
          <p>
            SpeakAce is built for learners who want a faster record-review-retry loop, and for
            teachers who want more visibility between lessons.
          </p>
        </div>

        <div>
          <span className="eyebrow">Live review flow</span>
          <ReviewTicker items={reviewTickerItems} />
        </div>

        <div className="marketing-grid">
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

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Try the same workflow on your own answers.</h2>
            <p className="practice-copy">
              Start with a free speaking session or unlock Plus to get more daily minutes, deeper
              transcript review, and a cleaner improvement loop.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/practice">
              Start free practice
            </Link>
            <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=reviews_page">
              Unlock Plus
            </a>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }} />
      </main>
    </>
  );
}

function ReviewTicker({
  items
}: {
  items: Array<{ quote: string; author: string; role: string }>;
}) {
  const loopItems = [...items, ...items];

  return (
    <div className="testimonial-ticker-shell">
      <div className="testimonial-ticker-track">
        {loopItems.map((item, index) => (
          <article key={`${item.author}-${index}`} className="card testimonial-ticker-card">
            <p>&ldquo;{item.quote}&rdquo;</p>
            <strong>{item.author}</strong>
            <div className="practice-meta">{item.role}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
