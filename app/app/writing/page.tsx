import Link from "next/link";
import { cookies } from "next/headers";
import { listWritingPrompts } from "@/lib/writing-prompts";
import { getSessionCookieName, getAuthenticatedUser } from "@/lib/server/auth";
import { getWritingSummary } from "@/lib/writing-store";

export default async function WritingHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  const summary = profile ? await getWritingSummary(profile.id) : { totalSessions: 0, averageScore: 0, latestSession: null, recentSessions: [], weakestCategory: null };
  const taskOnePrompts = listWritingPrompts("ielts-writing-task-1", "Target").slice(0, 3);
  const taskTwoPrompts = listWritingPrompts("ielts-writing-task-2", "Target").slice(0, 3);

  return (
    <main className="page-shell section">
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gap: "1.5rem" }}>
        <div className="section-head" style={{ textAlign: "left" }}>
          <span className="eyebrow">Writing coach</span>
          <h1>IELTS writing now has two real practice tracks instead of one generic screen</h1>
          <p>Choose Task 1 for visual reports or Task 2 for essays, then move through the same score-improvement loop: draft, evaluate, compare, retry.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
          {[
            { label: "Writing attempts", value: String(summary.totalSessions) },
            { label: "Average writing band", value: summary.averageScore ? summary.averageScore.toFixed(1) : "-" },
            { label: "Weakest category", value: summary.weakestCategory ?? "-" }
          ].map((item) => (
            <div key={item.label} className="card" style={{ padding: "1rem" }}>
              <div className="practice-meta">{item.label}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "0.4rem" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "1rem" }}>
            <div>
              <strong style={{ display: "block", marginBottom: "0.45rem" }}>Task 1: visual report practice</strong>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>Best when the learner needs overview writing, comparison language, and data description instead of opinion writing.</p>
            </div>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {taskOnePrompts.map((prompt) => (
                <Link key={prompt.id} href={`/app/writing/task-1?promptId=${prompt.id}&difficulty=${prompt.difficulty}`} className="button button-secondary" style={{ justifyContent: "flex-start", textAlign: "left", whiteSpace: "normal", lineHeight: 1.5 }}>
                  {prompt.title}
                </Link>
              ))}
            </div>
            <Link href="/app/writing/task-1" className="button button-primary">Open Writing Task 1</Link>
          </section>

          <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "1rem" }}>
            <div>
              <strong style={{ display: "block", marginBottom: "0.45rem" }}>Task 2: essay practice</strong>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>Best when the learner needs argument structure, examples, opinion clarity, and a more conversion-friendly score-improvement loop.</p>
            </div>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {taskTwoPrompts.map((prompt) => (
                <Link key={prompt.id} href={`/app/writing/task-2?promptId=${prompt.id}&difficulty=${prompt.difficulty}`} className="button button-secondary" style={{ justifyContent: "flex-start", textAlign: "left", whiteSpace: "normal", lineHeight: 1.5 }}>
                  {prompt.title}
                </Link>
              ))}
            </div>
            <Link href="/app/writing/task-2" className="button button-primary">Open Writing Task 2</Link>
          </section>
        </div>

        <section className="card" style={{ padding: "1.1rem" }}>
          <strong style={{ display: "block", marginBottom: "0.7rem" }}>Latest writing progress</strong>
          {summary.latestSession?.report ? (
            <div style={{ display: "grid", gap: "0.8rem" }}>
              <div style={{ padding: "0.9rem", borderRadius: 14, background: "color-mix(in oklch, var(--primary) 7%, var(--card) 93%)", border: "1px solid var(--border)" }}>
                <div className="practice-meta">{summary.latestSession.taskType === "ielts-writing-task-1" ? "Task 1" : "Task 2"}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.35rem" }}>{summary.latestSession.prompt.title}</div>
                <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1, marginTop: "0.45rem" }}>{summary.latestSession.report.overall}</div>
                <p style={{ margin: "0.45rem 0 0", color: "var(--muted-foreground)" }}>{summary.latestSession.report.scaleLabel}</p>
              </div>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>{summary.latestSession.report.nextExercise}</p>
              <Link href={`/app/writing/results/${summary.latestSession.id}`} className="button button-primary">Open latest writing report</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.8rem" }}>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>No writing result yet. The first finished draft will unlock score history, retry comparison, sentence comments, and PDF export.</p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/app/writing/task-1" className="button button-secondary">Try Task 1</Link>
                <Link href="/app/writing/task-2" className="button button-primary">Try Task 2</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
