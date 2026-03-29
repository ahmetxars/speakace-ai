import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", maxWidth: 620 }}>
        <span className="eyebrow">Not found</span>
        <h1>Session unavailable</h1>
        <p style={{ color: "var(--muted)" }}>
          This practice result may have been lost after a server restart. Start a new speaking session to generate fresh feedback.
        </p>
        <Link className="button button-primary" href="/app/practice">
          New session
        </Link>
      </div>
    </main>
  );
}
