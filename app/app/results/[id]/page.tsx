import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ResultView } from "@/components/result-view";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getProgressSummary, getSession } from "@/lib/store";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedUserFromCookies();
  if (!profile || profile.role === "guest") {
    redirect("/auth");
  }

  const { id } = await params;
  const session = await getSession(id);

  if (!session) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", maxWidth: 620 }}>
          <span className="eyebrow">Session unavailable</span>
          <h1>This result could not be loaded</h1>
          <p style={{ color: "var(--muted)" }}>
            This practice result may have been lost after a server restart. Start a new speaking session to generate fresh feedback.
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

  if (session.userId !== profile.id && !profile.isAdmin) {
    notFound();
  }

  const summary = await getProgressSummary(session.userId);

  return <ResultView session={session} summary={summary} />;
}
