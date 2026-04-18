import Link from "next/link";

export default function IeltsWritingAiPage() {
  return (
    <main className="page-shell section">
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1.5rem" }}>
        <div className="section-head">
          <span className="eyebrow">IELTS Writing AI</span>
          <h1>IELTS Writing Task 2 feedback with score estimates, corrected essays, and retry guidance</h1>
          <p>SpeakAce now gives you a productive-skills workflow: write one essay, get a band estimate, study a corrected version, and retry the same task with a clearer structure.</p>
        </div>

        <div className="marketing-grid">
          {[
            {
              title: "Band-style score breakdown",
              body: "See Task Response, Coherence and Cohesion, Lexical Resource, and Grammar Range and Accuracy in one report."
            },
            {
              title: "Corrected version",
              body: "Compare your draft with a stronger IELTS-style version instead of guessing how to improve it."
            },
            {
              title: "Retry workflow",
              body: "Open the same task again, rewrite faster, and see whether your score is actually moving."
            }
          ].map((item) => (
            <article key={item.title} className="card feature-card">
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="card quick-pitch">
          <h2 style={{ marginBottom: "0.55rem" }}>Practice both productive IELTS skills inside one account</h2>
          <p className="practice-copy" style={{ marginBottom: "0.9rem" }}>Use SpeakAce for speaking feedback, interview practice, and now IELTS Writing Task 2 scoring with corrected versions and PDF reports.</p>
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/writing">Open Writing Coach</Link>
            <Link className="button button-secondary" href="/pricing">See plans</Link>
            <Link className="button button-secondary" href="/app/practice">Open speaking practice</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
