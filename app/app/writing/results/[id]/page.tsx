import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { WritingResultView } from "@/components/writing-result-view";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getWritingSession, getWritingSummary } from "@/lib/writing-store";

export default async function WritingResultPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedUserFromCookies();
  if (!profile || profile.role === "guest") {
    redirect("/auth");
  }

  const { id } = await params;
  const session = await getWritingSession(id);

  if (!session) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", maxWidth: 620 }}>
          <span className="eyebrow">Writing unavailable</span>
          <h1>This writing result could not be loaded</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>The result may have been lost after a server restart. Start a new writing task to generate fresh feedback.</p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/writing/task-2">New writing task</Link>
            <Link className="button button-secondary" href="/app/writing">Back to writing hub</Link>
          </div>
        </div>
      </main>
    );
  }

  if (session.userId !== profile.id && !profile.isAdmin) {
    notFound();
  }

  const summary = await getWritingSummary(session.userId);
  return <WritingResultView session={session} summary={summary} />;
}
