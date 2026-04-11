import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", maxWidth: 620 }}>
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p style={{ color: "var(--muted)" }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/">
            Go home
          </Link>
          <Link className="button button-secondary" href="/app/practice">
            Start practicing
          </Link>
        </div>
      </div>
    </main>
  );
}
