import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseUnit } from "@/components/adsense-unit";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Platform for Teachers | SpeakAce",
  description:
    "Track student speaking progress, assign homework, and review IELTS or TOEFL speaking attempts with SpeakAce. See teacher tools ->",
  alternates: {
    canonical: "/for-teachers"
  },
  openGraph: {
    title: "IELTS Speaking Platform for Teachers | SpeakAce",
    description:
      "Teacher tools for IELTS and TOEFL speaking practice, homework, risk alerts, and class progress tracking.",
    url: `${siteConfig.domain}/for-teachers`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function TeachersPage() {
  return (
    <>
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

        <AdSenseUnit />

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Share prompt sets</h3>
            <p>Use shared study lists to guide what students should repeat before the next live lesson.</p>
          </article>
          <article className="card feature-card">
            <h3>Faster teacher notes</h3>
            <p>Session comments, templates, and replay views reduce feedback time while keeping quality high.</p>
          </article>
          <article className="card feature-card">
            <h3>Demo before rollout</h3>
            <p>Use the teacher demo page to show the workflow to coordinators or decision makers before onboarding real classes.</p>
          </article>
        </div>

        {/* How the teacher workflow looks */}
        <div className="section-head" style={{ paddingTop: "0.5rem" }}>
          <span className="eyebrow">Workflow</span>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 0.98 }}>
            How the teacher workflow looks
          </h2>
          <p>Five steps from class creation to the next lesson — no extra software required.</p>
        </div>

        <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.1rem" }}>
          {[
            { step: 1, title: "Create a class and share the code", body: "Set up your class in the teacher portal in under two minutes. Share the class join code with students via message, email, or your existing learning management tool." },
            { step: 2, title: "Students join and start practising immediately", body: "Once students join with the code, they can start speaking practice right away. You approve new members, so only your actual students can enter." },
            { step: 3, title: "See scores, weak skills, and risk alerts in real time", body: "Your dashboard shows each student's recent scores, weakest skill category, attempt frequency, and an at-risk flag if someone has gone quiet for too long." },
            { step: 4, title: "Assign targeted homework on weak areas", body: "Turn any weak skill into a homework assignment with a due date, a note, and optional prompt suggestions. Students see it immediately in their dashboard." },
            { step: 5, title: "Review attempts and leave comments before the next lesson", body: "Open any student's session, read their transcript and improved answer, and leave a comment. You walk into the next lesson already knowing what to focus on." }
          ].map(({ step, title, body }) => (
            <div key={step} style={{ display: "grid", gridTemplateColumns: "3rem 1fr", gap: "1rem", alignItems: "start" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.1rem",
                flexShrink: 0
              }}>
                {step}
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: "0.3rem" }}>{title}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What teachers say */}
        <div className="section-head" style={{ paddingTop: "0.5rem" }}>
          <span className="eyebrow">What teachers say</span>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 0.98 }}>
            From teachers using SpeakAce with real classes
          </h2>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <p style={{ fontStyle: "italic", lineHeight: 1.7 }}>
              "I used to spend 20 minutes before each lesson trying to remember who had practised and who hadn't. Now I open the dashboard and see everything in one column — scores, weak skills, and which students haven't logged a session in three days."
            </p>
            <div style={{ marginTop: "1rem", color: "var(--muted)", fontSize: "0.9rem" }}>
              <strong>Sarah T.</strong> — IELTS preparation teacher, online
            </div>
          </article>
          <article className="card feature-card">
            <p style={{ fontStyle: "italic", lineHeight: 1.7 }}>
              "My students used to say they were practising at home but I had no way to check. With SpeakAce I can see the actual attempt timestamps. It has changed the accountability dynamic in my classes completely."
            </p>
            <div style={{ marginTop: "1rem", color: "var(--muted)", fontSize: "0.9rem" }}>
              <strong>Marcus O.</strong> — English teacher at a language school
            </div>
          </article>
          <article className="card feature-card">
            <p style={{ fontStyle: "italic", lineHeight: 1.7 }}>
              "I assign homework targeting fluency for two students and vocabulary for three others — all from the same panel. Before SpeakAce I would have had to create separate tasks manually. This saves me at least an hour per week."
            </p>
            <div style={{ marginTop: "1rem", color: "var(--muted)", fontSize: "0.9rem" }}>
              <strong>Nadia K.</strong> — TOEFL speaking coach
            </div>
          </article>
        </div>

        {/* Pricing for teachers */}
        <div className="card institution-cta" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">Pricing for teachers</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Individual teachers and institutions</h2>
            <p className="practice-copy">
              Individual teachers can access all teacher tools on the Plus plan — including class creation, homework assignments, student detail views,
              and at-risk alerts. There is no separate teacher licence to buy.
            </p>
            <p className="practice-copy" style={{ marginTop: "0.75rem" }}>
              Institutions and schools that need bulk student seats, shared class management across multiple teachers, and priority support can
              contact us for custom institutional pricing. We work with training centres, universities, and language schools.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/pricing">
              See Plus pricing
            </Link>
            <Link className="button button-secondary" href="/for-institutions">
              Institutional pricing
            </Link>
          </div>
        </div>

        {/* FAQ for teachers */}
        <div className="section-head" style={{ paddingTop: "0.5rem" }}>
          <span className="eyebrow">FAQ</span>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 0.98 }}>
            Teacher questions answered
          </h2>
        </div>

        <div style={{ display: "grid", gap: "0.9rem" }}>
          {[
            {
              q: "Do students need to pay?",
              a: "Students can join a class and complete speaking practice on the free plan. If they want more daily sessions or fuller feedback, they can upgrade independently — but it is not required to participate in your class."
            },
            {
              q: "Can I use SpeakAce alongside my existing textbook?",
              a: "Yes. SpeakAce works as a practice layer alongside whatever materials you already use. You set the homework prompts, and students complete their practice attempts here. You then review results before the next in-class session."
            },
            {
              q: "How many students can I have in one class?",
              a: "Individual teacher accounts on the Plus plan support standard class sizes. If you need larger classes or multiple teachers managing the same group, get in touch — institutional plans are built for that."
            },
            {
              q: "Is there a demo I can show my school coordinator?",
              a: "Yes. The teacher demo page shows a pre-filled class with example students, scores, and homework assignments. You can walk a coordinator through the full workflow without needing a real class set up first."
            }
          ].map(({ q, a }) => (
            <article key={q} className="card feature-card" style={{ padding: "1.2rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{q}</h3>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>{a}</p>
            </article>
          ))}
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
            <Link className="button button-secondary" href="/teacher-demo">
              View demo class
            </Link>
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
