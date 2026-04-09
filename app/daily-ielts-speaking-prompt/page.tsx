import Link from "next/link";
import type { Metadata } from "next";
import { AdSenseUnit } from "@/components/adsense-unit";
import { siteConfig } from "@/lib/site";

const prompts = [
  {
    title: "Describe a skill you want to improve",
    tips: ["State what the skill is.", "Explain why it matters to you.", "Give one real example."],
    followUp: "What is the best way to improve this skill?"
  },
  {
    title: "Describe a place you enjoy visiting",
    tips: ["Say where it is.", "Explain how often you go there.", "Describe why it feels special."],
    followUp: "Do people prefer quiet places or busy places today?"
  },
  {
    title: "Describe a useful app on your phone",
    tips: ["Say what the app does.", "Explain when you use it.", "Give one practical benefit."],
    followUp: "Do apps make daily life easier or more distracting?"
  }
];

export const metadata: Metadata = {
  title: "Daily IELTS Speaking Prompt | SpeakAce",
  description:
    "Get a daily IELTS speaking prompt, quick structure tips, and a direct path into AI speaking practice. Start free ->",
  alternates: {
    canonical: `${siteConfig.domain}/daily-ielts-speaking-prompt`
  }
};

export default function DailyIeltsSpeakingPromptPage() {
  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem", paddingBottom: "10rem" }}>
        <div className="card" style={{ display: "grid", gap: "1.2rem", padding: "1.5rem" }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Daily practice</span>
            <h1 style={{ fontSize: "clamp(2.5rem, 5.8vw, 4.6rem)", lineHeight: 0.97 }}>
              Daily IELTS speaking prompts for cleaner fluency and stronger answers.
            </h1>
            <p>
              Use one focused IELTS-style prompt each day, follow a simple structure, and move into timed AI feedback
              inside SpeakAce when you are ready to record.
            </p>
          </div>

          <div className="hero-actions" style={{ marginTop: 0 }}>
            <Link href="/app/practice" className="button button-primary">
              Start today&apos;s prompt
            </Link>
            <Link href="/free-ielts-speaking-test" className="button button-secondary">
              Try the free test
            </Link>
          </div>
        </div>

        <div className="section-head">
          <span className="eyebrow">Prompt set</span>
          <h2>Three prompts you can practice right now</h2>
          <p>Each prompt gives you a clear angle, a few structure hints, and one follow-up so your answer feels closer to a real IELTS response.</p>
        </div>

        <div className="marketing-grid">
          {prompts.map((prompt, index) => (
            <article key={prompt.title} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>
                Prompt {index + 1}
              </div>
              <h2 style={{ fontSize: "1.35rem", marginBottom: "0.9rem" }}>{prompt.title}</h2>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--muted)", lineHeight: 1.8 }}>
                {prompt.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <div className="spotlight-card" style={{ marginTop: "1rem" }}>
                <strong>Follow-up</strong>
                <p style={{ marginTop: "0.45rem" }}>{prompt.followUp}</p>
              </div>
              <Link href="/app/practice" className="button button-secondary" style={{ marginTop: "1rem", width: "fit-content" }}>
                Practice this prompt
              </Link>
            </article>
          ))}
        </div>

        <AdSenseUnit />

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Simple daily rhythm</span>
            <h2 style={{ margin: "0.8rem 0 0.55rem" }}>One prompt, one structure, one retry.</h2>
            <p className="practice-copy">
              The goal is not to do too much. Record one answer, review what sounded weak, then retry the same idea with cleaner linking and one better example.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Open practice
            </Link>
            <Link className="button button-secondary" href="/resources">
              Browse resources
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
