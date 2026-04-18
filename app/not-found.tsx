import Link from "next/link";

export default function NotFound() {
  const popularTopics: Array<{ title: string; href: string }> = [
    {
      title: "Hometown questions",
      href: "/blog/how-to-answer-ielts-speaking-part-1-hometown-questions-more-naturally"
    },
    {
      title: "Useful object cue card",
      href: "/blog/how-to-improve-useful-object-cue-card-answers-in-ielts-speaking"
    },
    {
      title: "Part 3 opinion answers",
      href: "/blog/how-to-give-stronger-opinion-answers-in-ielts-speaking-part-3"
    }
  ];

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", maxWidth: 720, display: "grid", gap: "1rem" }}>
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p style={{ color: "var(--muted)" }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.7rem" }}>
          <strong>Most popular IELTS topics</strong>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {popularTopics.map((item) => (
              <Link key={item.href} href={item.href as never} className="interactive-link-card" style={{ textDecoration: "none" }}>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/">
            Go home
          </Link>
          <Link className="button button-secondary" href="/free-ielts-speaking-test">
            Start free test
          </Link>
          <Link className="button button-secondary" href="/app/practice">
            Start practicing
          </Link>
        </div>
      </div>
    </main>
  );
}
