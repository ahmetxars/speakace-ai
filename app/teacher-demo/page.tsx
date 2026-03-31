import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

const demoStudents = [
  { name: "Mina", average: "6.5", weak: "Pronunciation", status: "Needs retry" },
  { name: "Omar", average: "6.0", weak: "Topic development", status: "Homework due" },
  { name: "Lina", average: "7.0", weak: "Fluency", status: "Trending up" }
];

export const metadata: Metadata = {
  title: "Teacher Demo Class",
  description:
    "See how a teacher demo class can look inside SpeakAce with homework, risk alerts, student summaries, and speaking progress.",
  alternates: { canonical: "/teacher-demo" },
  openGraph: {
    title: "Teacher Demo Class | SpeakAce",
    description:
      "A demo teacher class view for IELTS and TOEFL speaking workflows, student tracking, and homework follow-up.",
    url: `${siteConfig.domain}/teacher-demo`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function TeacherDemoPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Teacher demo</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>
            A demo class that shows how SpeakAce can work for teachers
          </h1>
          <p>
            This page simulates the kind of class view a teacher or school buyer expects: progress,
            risk signals, homework flow, and next actions without spreadsheet chaos.
          </p>
        </div>

        <div className="stats-strip">
          <div className="card stat-strip-card"><div className="practice-meta">Students</div><strong>18</strong></div>
          <div className="card stat-strip-card"><div className="practice-meta">Weekly attempts</div><strong>62</strong></div>
          <div className="card stat-strip-card"><div className="practice-meta">At-risk students</div><strong>4</strong></div>
          <div className="card stat-strip-card"><div className="practice-meta">Homework completion</div><strong>78%</strong></div>
        </div>

        <div className="marketing-grid">
          {demoStudents.map((student) => (
            <article key={student.name} className="card feature-card">
              <h3>{student.name}</h3>
              <p>Average score: {student.average}</p>
              <p>Weakest skill: {student.weak}</p>
              <div className="pill">{student.status}</div>
            </article>
          ))}
        </div>

        <div className="card comparison-card">
          <h2 style={{ marginBottom: "0.9rem" }}>Why this matters for teachers</h2>
          <div className="comparison-table">
            <div className="comparison-head">Problem</div>
            <div className="comparison-head">What SpeakAce gives</div>
            <div className="comparison-cell">Students practice between lessons but teachers cannot see it clearly.</div>
            <div className="comparison-cell">Replay, progress, weak skill, and attempt tracking in one place.</div>
            <div className="comparison-cell">Homework is hard to follow and easy to ignore.</div>
            <div className="comparison-cell">Due dates, class assignment, and at-risk alerts.</div>
          </div>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Use the demo to sell the class workflow</h2>
            <p className="practice-copy">
              This page is built to help you explain the teacher side quickly to language schools,
              coordinators, and course owners.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/for-schools">
              Open school page
            </Link>
            <Link className="button button-secondary" href="/app/teacher">
              Open teacher portal
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
