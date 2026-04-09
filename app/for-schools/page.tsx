import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseUnit } from "@/components/adsense-unit";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Platform for Schools | SpeakAce",
  description:
    "Run IELTS and TOEFL speaking practice with school dashboards, analytics, homework, and institution controls. Request a demo ->",
  alternates: {
    canonical: "/for-schools"
  },
  openGraph: {
    title: "IELTS Speaking Platform for Schools | SpeakAce",
    description:
      "School-ready IELTS and TOEFL speaking platform with classes, analytics, homework, and institution workflows.",
    url: `${siteConfig.domain}/for-schools`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function SchoolsPage() {
  return (
    <>
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

        <AdSenseUnit />

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Demo class workflow</h3>
            <p>Use a public demo class page to show buyers what the teacher side looks like before any real onboarding.</p>
          </article>
          <article className="card feature-card">
            <h3>Student engagement signals</h3>
            <p>At-risk alerts, progress summaries, and assignment completion help schools spot churn early.</p>
          </article>
          <article className="card feature-card">
            <h3>Ready for add-on sales</h3>
            <p>Use SpeakAce as a digital speaking lab, premium add-on, or internal coaching workflow for IELTS programs.</p>
          </article>
        </div>

        <div className="comparison-card card">
          <h2 style={{ marginBottom: "0.9rem" }}>School-ready package options</h2>
          <div className="marketing-grid">
            {[
              {
                title: "Starter cohort",
                body: "Best for a small IELTS class that wants speaking homework, retry loops, and teacher review between lessons.",
                meta: "1 teacher · 1-2 classes · core reporting"
              },
              {
                title: "Growth program",
                body: "Built for schools that want class approvals, shared study lists, analytics, and more structured speaking follow-up.",
                meta: "Multiple classes · analytics · study workflows"
              },
              {
                title: "Institution rollout",
                body: "For schools turning SpeakAce into a digital speaking lab with demos, exports, and institution-wide visibility.",
                meta: "Institution admin · exports · school-wide tracking"
              }
            ].map((item) => (
              <article key={item.title} className="card feature-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="practice-meta">{item.meta}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="card comparison-card">
          <h2 style={{ marginBottom: "0.9rem" }}>Why schools can position SpeakAce well</h2>
          <div className="comparison-table">
            <div className="comparison-head">Need</div>
            <div className="comparison-head">SpeakAce fit</div>
            <div className="comparison-cell">Speaking practice outside live lessons</div>
            <div className="comparison-cell">Students can practice independently with transcript review and AI coaching.</div>
            <div className="comparison-cell">Teacher oversight without heavy admin</div>
            <div className="comparison-cell">Class dashboards, homework, risk signals, and institution analytics.</div>
          </div>
        </div>

        <div className="card lead-capture-card">
          <div>
            <span className="eyebrow">School demo</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Request a school demo follow-up</h2>
            <p className="practice-copy">
              Leave an email and SpeakAce will send a quick school-focused follow-up plus the best next pages to review.
            </p>
          </div>
          <LeadCaptureForm source="schools_demo" />
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
            <Link className="button button-secondary" href="/teacher-demo">
              Open demo class
            </Link>
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
