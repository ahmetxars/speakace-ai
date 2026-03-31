import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "SpeakAce for Teachers",
  description:
    "Use SpeakAce to track student speaking progress, assign homework, review attempts, and support IELTS and TOEFL learners between lessons.",
  alternates: {
    canonical: "/for-teachers"
  }
};

export default function TeachersPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">For teachers</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            Keep student speaking practice active between lessons
          </h1>
          <p>
            SpeakAce gives teachers a cleaner way to monitor speaking attempts, spot weak skills,
            approve class joins, assign homework, and guide IELTS and TOEFL students with less admin work.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Track student progress</h3>
            <p>See recent scores, weakest skills, trend direction, and replay attempts from one panel.</p>
          </article>
          <article className="card feature-card">
            <h3>Assign speaking homework</h3>
            <p>Turn weak answers into clear next tasks with due dates, notes, and class-level distribution.</p>
          </article>
          <article className="card feature-card">
            <h3>Review class risk faster</h3>
            <p>Use at-risk alerts and leaderboard views to focus attention where a student needs the most help.</p>
          </article>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Teacher workflow</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Built for coaching, not spreadsheet admin</h2>
            <p className="practice-copy">
              Teacher tools already include class codes, homework, approvals, announcements, shared study
              lists, and student detail pages.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/teacher">
              Open teacher portal
            </Link>
            <Link className="button button-secondary" href="/auth">
              Create account
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
