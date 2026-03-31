import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { guidePages } from "@/lib/seo-growth";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return guidePages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = guidePages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/guides/${page.slug}` },
    openGraph: {
      title: `${page.title} | SpeakAce`,
      description: page.description,
      url: `${siteConfig.domain}/guides/${page.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function GuideDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = guidePages.find((item) => item.slug === slug);
  if (!page) notFound();

  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <div className="marketing-grid">
          {page.bullets.map((bullet) => (
            <article key={bullet} className="card feature-card">
              <h2 style={{ fontSize: "1.25rem" }}>Key takeaway</h2>
              <p>{bullet}</p>
            </article>
          ))}
        </div>
        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{page.cta}</h2>
            <p className="practice-copy">
              Better guide content should always point toward an action the visitor can take on the
              same day.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Start practice
            </Link>
            <Link className="button button-secondary" href="/pricing">
              See Plus plan
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
