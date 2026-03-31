import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { seoTopicPages } from "@/lib/seo-topics";
import { siteConfig } from "@/lib/site";

const weeklyPrompts = seoTopicPages.slice(0, 5);

export const metadata: Metadata = {
  title: "Weekly IELTS Speaking Challenge",
  description:
    "Join a weekly IELTS speaking challenge with 5 prompts, retry goals, and a simple transcript-based improvement loop.",
  alternates: { canonical: "/weekly-ielts-speaking-challenge" },
  openGraph: {
    title: "Weekly IELTS Speaking Challenge | SpeakAce",
    description:
      "Use a weekly IELTS speaking challenge to build consistency, confidence, and stronger speaking structure.",
    url: `${siteConfig.domain}/weekly-ielts-speaking-challenge`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function WeeklyIeltsSpeakingChallengePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Weekly challenge</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            A weekly IELTS speaking challenge that gives people a reason to come back.
          </h1>
          <p>
            One of the easiest ways to build habit is to reduce choice. This weekly challenge gives
            students 5 prompts, one retry goal, and a clear next step.
          </p>
        </div>

        <div className="marketing-grid">
          {weeklyPrompts.map((item, index) => (
            <article key={item.slug} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Day {index + 1}</div>
              <h2 style={{ fontSize: "1.3rem" }}>{item.title}</h2>
              <p>{item.prompt}</p>
              <p className="practice-meta">{item.tip}</p>
              <Link className="button button-secondary" href={`/ielts-speaking-topics/${item.slug}`}>
                Open prompt page
              </Link>
            </article>
          ))}
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Challenge rule</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Record once, review once, retry once.</h2>
            <p className="practice-copy">
              The habit loop is simple: complete the first answer, check the transcript, then retry
              the same prompt with one stronger example or one cleaner structure.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Start the challenge
            </Link>
            <Link className="button button-secondary" href="/resources">
              Open resources
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
