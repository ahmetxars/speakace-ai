import Link from "next/link";
import { SessionReplay } from "@/components/session-replay";
import { getProgressSummary, getSession } from "@/lib/store";

export default async function SessionReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", maxWidth: 620 }}>
          <span className="eyebrow">Session unavailable</span>
          <h1>This session could not be loaded</h1>
          <p style={{ color: "var(--muted)" }}>
            This practice session may have been lost after a server restart. Start a new speaking session to generate fresh feedback.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              New session
            </Link>
            <Link className="button button-secondary" href="/app">
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }
  const summary = await getProgressSummary(session.userId);
  return <SessionReplay session={session} summary={summary} />;
}
