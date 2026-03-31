import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Part 3 Questions",
  description:
    "Practice IELTS Speaking Part 3 questions with better discussion structure, clearer examples, and stronger answer depth.",
  alternates: { canonical: "/ielts-speaking-part-3-questions" },
  openGraph: {
    title: "IELTS Speaking Part 3 Questions | SpeakAce",
    description:
      "A practical guide to IELTS Speaking Part 3 questions with more depth, comparison, and clearer discussion patterns.",
    url: `${siteConfig.domain}/ielts-speaking-part-3-questions`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function Part3GuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Part 3 guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", lineHeight: 0.96 }}>
            IELTS Speaking Part 3 questions need stronger discussion, not just longer answers
          </h1>
          <p>
            The fastest way to sound better in Part 3 is to add clearer logic. One opinion, one
            reason, one example, and sometimes one comparison often works better than rambling.
          </p>
        </div>

        <div className="marketing-grid">
          {[
            "Cause and effect",
            "Compare past and present",
            "Explain both sides",
            "Give one real example",
            "Use clearer transitions",
            "Finish with a clean final point"
          ].map((item) => (
            <article key={item} className="card feature-card">
              <h2>{item}</h2>
              <p>
                This pattern helps Part 3 answers feel more advanced and more controlled without
                forcing complex language.
              </p>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Use feedback to sound more analytical</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              SpeakAce shows where your discussion stays too basic, where your examples are weak,
              and what to improve on the next attempt.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">
                Practice Part 3
              </Link>
              <Link className="button button-secondary" href="/ielts-band-score-guide">
                See score guide
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
