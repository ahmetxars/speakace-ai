import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const tips = [
  "Short idea blocks sound more confident than long, confused answers.",
  "Replay helps you hear hesitation patterns you do not notice while speaking.",
  "Retrying the same prompt builds control faster than always jumping to new questions.",
  "A clear example makes you feel more grounded and less likely to panic.",
  "Confidence grows when progress becomes visible, not when pressure gets ignored."
];

export const metadata: Metadata = {
  title: "English Speaking Confidence",
  description:
    "Build more confidence in English speaking with repeat practice, transcript review, and clearer answer structure.",
  alternates: { canonical: "/english-speaking-confidence" },
  openGraph: {
    title: "English Speaking Confidence | SpeakAce",
    description:
      "Learn how better structure, replay, and faster feedback can improve English speaking confidence.",
    url: `${siteConfig.domain}/english-speaking-confidence`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function EnglishSpeakingConfidencePage() {
  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Confidence guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", lineHeight: 0.96 }}>
            English speaking confidence improves faster when the feedback loop is short
          </h1>
          <p>
            Confidence is not only about mindset. It usually grows when learners practice more
            often, hear themselves clearly, and know exactly what changed after each attempt.
          </p>
        </div>

        <div className="marketing-grid">
          {tips.map((tip) => (
            <article key={tip} className="card feature-card">
              <h2 style={{ fontSize: "1.2rem" }}>Confidence tip</h2>
              <p>{tip}</p>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">Turn confidence into score growth</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>
                A stronger speaking routine creates calmer speaking
              </h2>
              <p className="practice-copy">
                SpeakAce combines timed practice, transcript review, better sample answers, and
                retry flow so learners can feel more stable under pressure.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-secondary" href="/resources">
                Browse resources
              </Link>
              <Link className="button button-primary" href="/app/practice">
                Start practice
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
