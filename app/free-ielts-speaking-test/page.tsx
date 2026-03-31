import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free IELTS Speaking Test",
  description:
    "Take a free IELTS speaking test with AI feedback, transcript review, and band-focused practice inside SpeakAce.",
  alternates: { canonical: "/free-ielts-speaking-test" },
  openGraph: {
    title: "Free IELTS Speaking Test | SpeakAce",
    description:
      "Practice a free IELTS speaking test online with transcript review and score-focused AI feedback.",
    url: `${siteConfig.domain}/free-ielts-speaking-test`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function FreeIeltsSpeakingTestPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Free test</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            Take a free IELTS speaking test before you decide to pay for anything.
          </h1>
          <p>
            SpeakAce lets you try a real speaking flow first: timed practice, transcript review,
            estimated score signals, and a clearer idea of what needs work.
          </p>
        </div>

        <div className="marketing-grid">
          {[
            {
              title: "Timed test feel",
              description:
                "Practice under light time pressure so the answer sounds closer to an exam response than a casual chat."
            },
            {
              title: "Transcript review",
              description:
                "See what you really said, not what you meant to say, so weak structure and repeated words become obvious."
            },
            {
              title: "Band-focused feedback",
              description:
                "The goal is not generic English correction. It is stronger IELTS speaking performance."
            }
          ].map((item) => (
            <article key={item.title} className="card feature-card">
              <h2 style={{ fontSize: "1.35rem" }}>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Try now</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Start with a free speaking session.</h2>
            <p className="practice-copy">
              The best way to understand the product is to record one answer, read the transcript,
              and decide whether the feedback loop feels useful.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Start free test
            </Link>
            <Link className="button button-secondary" href="/pricing">
              See Plus plan
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
