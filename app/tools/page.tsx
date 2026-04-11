import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { toolPages } from "@/lib/seo-growth";
import { getToolVisual } from "@/lib/tool-visuals";

export const metadata: Metadata = {
  title: "Free IELTS Speaking Tools | SpeakAce",
  description:
    "Explore free IELTS speaking tools, topic generators, study plans, and score-focused practice helpers. Try a tool free ->",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free IELTS Speaking Tools | SpeakAce",
    description:
      "A hub of free IELTS speaking tools and top-of-funnel pages designed to pull learners into practice.",
    url: `${siteConfig.domain}/tools`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function ToolsHubPage() {
  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Tools</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            Free speaking tools, planners, and generators.
          </h1>
          <p>
            Start with calculators, generators, and simple planners when you want a low-friction
            way to move into speaking practice.
          </p>
        </div>
        <div className="marketing-grid">
          {/* Standalone interactive tools — always shown at top */}
          <article className="card feature-card interactive-link-card">
            <div className="tool-card-visual" aria-hidden="true">
              <span className="tool-card-icon">🎯</span>
              <span className="pill tool-card-badge">Free</span>
            </div>
            <h2 style={{ fontSize: "1.35rem" }}>IELTS Band Score Estimator</h2>
            <p>Estimate your IELTS speaking band score across fluency, pronunciation, grammar, and vocabulary — instantly.</p>
            <div className="interactive-link-card-footer">
              <span className="interactive-link-card-tag">Interactive</span>
              <Link className="button button-secondary" href="/ielts-band-estimator">
                Open tool
              </Link>
            </div>
          </article>
          <article className="card feature-card interactive-link-card">
            <div className="tool-card-visual" aria-hidden="true">
              <span className="tool-card-icon">⏱️</span>
              <span className="pill tool-card-badge">Free</span>
            </div>
            <h2 style={{ fontSize: "1.35rem" }}>Speaking Practice Timer</h2>
            <p>A dedicated timer for IELTS Part 1, Part 2, and Part 3 speaking practice — set the part, start the clock, and stay on time.</p>
            <div className="interactive-link-card-footer">
              <span className="interactive-link-card-tag">Interactive</span>
              <Link className="button button-secondary" href="/speaking-timer">
                Open tool
              </Link>
            </div>
          </article>
          <article className="card feature-card interactive-link-card">
            <div className="tool-card-visual" aria-hidden="true">
              <span className="tool-card-icon">📚</span>
              <span className="pill tool-card-badge">Free</span>
            </div>
            <h2 style={{ fontSize: "1.35rem" }}>IELTS Phrase Bank</h2>
            <p>Browse high-scoring IELTS speaking phrases by category — openers, linkers, examples, and conclusions — ready to practise.</p>
            <div className="interactive-link-card-footer">
              <span className="interactive-link-card-tag">Reference</span>
              <Link className="button button-secondary" href="/speaking-phrase-bank">
                Open tool
              </Link>
            </div>
          </article>

          {toolPages.map((item) => (
            <article key={item.slug} className="card feature-card interactive-link-card">
              <div className="tool-card-visual" aria-hidden="true">
                <span className="tool-card-icon">{getToolVisual(item.slug).emoji}</span>
                <span className="pill tool-card-badge">{getToolVisual(item.slug).badge}</span>
              </div>
              <h2 style={{ fontSize: "1.35rem" }}>{item.title}</h2>
              <p>{item.description}</p>
              <div className="interactive-link-card-footer">
                <span className="interactive-link-card-tag">AI-powered</span>
                <Link className="button button-secondary" href={`/tools/${item.slug}`}>
                  {item.actionLabel ?? "Open tool"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
