import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const scoreSignals = [
  {
    title: "Fluency and pacing",
    description: "Short stops, broken rhythm, and weak endings often pull a score down."
  },
  {
    title: "Idea development",
    description: "Stronger examples and clearer reasoning often create faster score growth."
  },
  {
    title: "Structure and control",
    description: "Better organization helps the examiner follow the answer more easily."
  }
];

export const metadata: Metadata = {
  title: "IELTS Band Score Guide",
  description:
    "Understand how IELTS speaking band scores improve through better fluency, structure, examples, and answer control.",
  alternates: { canonical: "/ielts-band-score-guide" },
  openGraph: {
    title: "IELTS Band Score Guide | SpeakAce",
    description:
      "A simple guide to what actually improves IELTS speaking band score performance.",
    url: `${siteConfig.domain}/ielts-band-score-guide`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function IeltsBandScoreGuidePage() {
  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Band score guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>
            A higher IELTS speaking band score usually comes from better control, not harder words
          </h1>
          <p>
            Students often chase complex vocabulary too early. In practice, stronger fluency,
            clearer examples, and more stable structure usually move the score faster.
          </p>
        </div>

        <div className="marketing-grid">
          {scoreSignals.map((item) => (
            <article key={item.title} className="card feature-card">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card comparison-card">
            <h2 style={{ marginBottom: "0.8rem" }}>What helps the score move faster</h2>
            <div className="comparison-table">
              <div className="comparison-head">Weak pattern</div>
              <div className="comparison-head">Stronger pattern</div>
              <div className="comparison-cell">Short answers with no real example.</div>
              <div className="comparison-cell">Clear answer + one relevant detail + one closing thought.</div>
              <div className="comparison-cell">Generic memorized language.</div>
              <div className="comparison-cell">Natural control with more personal, relevant content.</div>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Practice the pattern, not just the theory</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              Use SpeakAce to record answers, review transcripts, estimate your score, and retry
              with a clearer plan.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">
                Start practice
              </Link>
              <Link className="button button-secondary" href="/pricing">
                See Plus
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
