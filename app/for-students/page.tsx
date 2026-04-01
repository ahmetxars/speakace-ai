import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "SpeakAce for Students",
  description: "See how SpeakAce helps IELTS and TOEFL students practice speaking with more structure, confidence, and daily momentum.",
  alternates: {
    canonical: "/for-students"
  },
  openGraph: {
    title: "SpeakAce for Students",
    description: "A student-focused IELTS and TOEFL speaking practice platform with AI feedback, retries, and transcript review.",
    url: `${siteConfig.domain}/for-students`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function StudentsPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">For students</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            Build a calmer, more repeatable IELTS and TOEFL speaking routine
          </h1>
          <p>
            SpeakAce helps students move beyond random practice by giving each answer a clearer loop:
            prompt, record, transcript, feedback, retry, and improvement.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Know what to fix next</h3>
            <p>Each attempt shows clearer next steps so practice feels directed instead of vague.</p>
          </article>
          <article className="card feature-card">
            <h3>Retry the same idea better</h3>
            <p>Use result review and study lists to revisit the same topic without losing your structure.</p>
          </article>
          <article className="card feature-card">
            <h3>Practice with more confidence</h3>
            <p>Daily prompts, guided answer modes, and simple tools make it easier to speak more often.</p>
          </article>
        </div>

        <div className="comparison-card card">
          <h2 style={{ marginBottom: "0.9rem" }}>Why students stay with SpeakAce</h2>
          <div className="comparison-table">
            <div className="comparison-head">Need</div>
            <div className="comparison-head">SpeakAce fit</div>
            <div className="comparison-cell">I do not know what to say</div>
            <div className="comparison-cell">Prompt pages, topic hubs, tools, and answer modes reduce blank-mind moments.</div>
            <div className="comparison-cell">I practice but do not feel progress</div>
            <div className="comparison-cell">Dashboard targets, review loops, and repeatable sessions make improvement more visible.</div>
          </div>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Student flow</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Designed to help you come back tomorrow, not just today</h2>
            <p className="practice-copy">
              SpeakAce combines free entry points, guided practice, stronger review loops, and Plus upgrades for students
              who want a more serious speaking routine.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/free-ielts-speaking-test">
              Try free test
            </Link>
            <Link className="button button-primary" href="/app/practice">
              Open practice
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
