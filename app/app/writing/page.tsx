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
  const prompts = listWritingPrompts("Target").slice(0, 6);

  return (
    <main className="page-shell section">
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1.5rem" }}>
        <div className="section-head" style={{ textAlign: "left" }}>
          <span className="eyebrow">Writing coach</span>
          <h1>IELTS Writing Task 2 that feels like a real score-improvement workflow</h1>
          <p>Write one essay, get a band estimate, compare it with a corrected version, and retry the same task with a clearer structure.</p>
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

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.7rem" }}>Start a new writing task</strong>
            <p style={{ marginTop: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>Task 2 is the strongest first step because it creates the clearest value: one essay, one score, one corrected version, and one better retry.</p>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {prompts.map((prompt) => (
                <Link key={prompt.id} href={`/app/writing/task-2?promptId=${prompt.id}&difficulty=${prompt.difficulty}`} className="button button-secondary" style={{ justifyContent: "flex-start", textAlign: "left", whiteSpace: "normal", lineHeight: 1.5 }}>
                  {prompt.title}
                </Link>
              ))}
            </div>
            <Link href="/app/writing/task-2" className="button button-primary" style={{ marginTop: "1rem" }}>Open Writing Task 2</Link>
          </section>

          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.7rem" }}>Latest writing progress</strong>
            {summary.latestSession?.report ? (
              <div style={{ display: "grid", gap: "0.8rem" }}>
                <div style={{ padding: "0.9rem", borderRadius: 14, background: "color-mix(in oklch, var(--primary) 7%, var(--card) 93%)", border: "1px solid var(--border)" }}>
                  <div className="practice-meta">{summary.latestSession.prompt.title}</div>
                  <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1, marginTop: "0.35rem" }}>{summary.latestSession.report.overall}</div>
                  <p style={{ margin: "0.45rem 0 0", color: "var(--muted-foreground)" }}>{summary.latestSession.report.scaleLabel}</p>
                </div>
                <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>{summary.latestSession.report.nextExercise}</p>
                <Link href={`/app/writing/results/${summary.latestSession.id}`} className="button button-primary">Open latest writing report</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.8rem" }}>
                <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>No writing result yet. The first finished essay will unlock score history, retry comparison, and PDF export.</p>
                <Link href="/app/writing/task-2" className="button button-primary">Write your first Task 2 essay</Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
