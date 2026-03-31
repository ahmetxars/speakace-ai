import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "SpeakAce for Schools",
  description:
    "SpeakAce helps language schools run IELTS and TOEFL speaking practice with class dashboards, analytics, homework, and institution controls.",
  alternates: {
    canonical: "/for-schools"
  }
};

export default function SchoolsPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">For schools</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            A ready-made IELTS and TOEFL speaking platform for language schools
          </h1>
          <p>
            SpeakAce combines student practice, teacher workflows, class analytics, and institution-level
            visibility in one product that can be used as a course add-on or digital speaking lab.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Institution analytics</h3>
            <p>Track active students, class averages, weak-skill patterns, overdue homework, and teacher activity.</p>
          </article>
          <article className="card feature-card">
            <h3>Multi-role workflows</h3>
            <p>Use student, teacher, and institution admin views in one system instead of managing separate tools.</p>
          </article>
          <article className="card feature-card">
            <h3>Designed for scale</h3>
            <p>Class-based onboarding, approvals, homework, study lists, and reporting make it easier to support more learners.</p>
          </article>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Institution fit</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Use it as a school product, not just a student app</h2>
            <p className="practice-copy">
              If you want a platform that helps classes keep speaking practice active every week,
              SpeakAce already has the right core systems in place.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/teacher/institution">
              View institution portal
            </Link>
            <Link className="button button-secondary" href="/pricing">
              View pricing
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
