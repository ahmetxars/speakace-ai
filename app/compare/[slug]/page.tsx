import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comparisonPages } from "@/lib/seo-growth";
import { siteConfig } from "@/lib/site";

function getComparisonLinks(slug: string) {
  if (slug.includes("best-ielts-speaking-app")) {
    return [
      { href: "/free-ielts-speaking-test", label: "Try free IELTS test" },
      { href: "/reviews", label: "Read reviews" }
    ];
  }
  if (slug.includes("toefl")) {
    return [
      { href: "/toefl-speaking-practice", label: "Open TOEFL practice" },
      { href: "/speaking-timer", label: "Use speaking timer" }
    ];
  }
  return [
    { href: "/app/practice", label: "Start practice" },
    { href: "/pricing", label: "See Plus" }
  ];
}

export function generateStaticParams() {
  return comparisonPages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = comparisonPages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/compare/${page.slug}` },
    openGraph: {
      title: `${page.title} | SpeakAce`,
      description: page.description,
      url: `${siteConfig.domain}/compare/${page.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function ComparisonDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = comparisonPages.find((item) => item.slug === slug);
  if (!page) notFound();
  const relatedLinks = getComparisonLinks(page.slug);

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Comparison</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <div className="marketing-grid">
          {page.bullets.map((bullet) => (
            <article key={bullet} className="card feature-card">
              <p style={{ margin: 0 }}>{bullet}</p>
            </article>
          ))}
        </div>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">Try it yourself</span>
          <h2 style={{ margin: 0 }}>The fastest way to compare is one real attempt — free and instant</h2>
          <p className="practice-copy" style={{ margin: 0 }}>
            Start a free speaking session, see your transcript and estimated band score, and decide
            whether SpeakAce fits your prep. No credit card, no commitment.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Start free practice
            </Link>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Get started free</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{page.cta}</h2>
            <p className="practice-copy">
              Create a free account and get your first band estimate in under a minute. No tutor booking,
              no waiting — just speak, review, and improve.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Start practice
            </Link>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
