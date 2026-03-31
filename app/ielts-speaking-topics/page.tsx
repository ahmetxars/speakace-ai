import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import { seoTopicPages } from "@/lib/seo-topics";

export const metadata: Metadata = {
  title: "IELTS Speaking Topics",
  description:
    "Find IELTS speaking topics and learn how to organize each answer with better structure, examples, and speaking flow.",
  alternates: { canonical: "/ielts-speaking-topics" },
  openGraph: {
    title: "IELTS Speaking Topics | SpeakAce",
    description:
      "Practice common IELTS speaking topics with structure guidance and links into AI-powered speaking tasks.",
    url: `${siteConfig.domain}/ielts-speaking-topics`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function IeltsSpeakingTopicsPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">IELTS topics</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>
            IELTS speaking topics are easier when your answer has a simple shape
          </h1>
          <p>
            Most students do not fail because the topic is hard. They struggle because the answer
            shape is weak. Start with a direct response, add one specific detail, then close clearly.
          </p>
        </div>

        <div className="marketing-grid">
          {seoTopicPages.map((topic) => (
            <article key={topic.slug} className="card feature-card">
              <h2 style={{ fontSize: "1.35rem" }}>{topic.title}</h2>
              <p>
                {topic.tip}
              </p>
              <Link className="button button-secondary" href={`/ielts-speaking-topics/${topic.slug}` as Route}>
                Open topic page
              </Link>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Turn topic lists into score-focused practice</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              SpeakAce helps you practice IELTS speaking topics with transcript review, improved
              sample answers, and repeat attempts that build real score growth.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">
                Start topic practice
              </Link>
              <Link className="button button-secondary" href="/ielts-speaking-part-2-topics">
                Part 2 guide
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
