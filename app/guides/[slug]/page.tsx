import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSenseUnit } from "@/components/adsense-unit";
import { guidePages } from "@/lib/seo-growth";
import { siteConfig } from "@/lib/site";

function getGuideLinks(slug: string) {
  if (slug.includes("cue-card") || slug.includes("part-2")) {
    return [
      { href: "/ielts-speaking-part-2-topics", label: "Open Part 2 topics" },
      { href: "/tools/ielts-cue-card-generator", label: "Use cue card generator" }
    ];
  }
  if (slug.includes("fluency")) {
    return [
      { href: "/ielts-speaking-part-1-questions", label: "Practice Part 1 fluency" },
      { href: "/daily-ielts-speaking-prompt", label: "Open daily prompt" }
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
    { href: "/pricing", label: "See Plus plan" }
  ];
}

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
  const relatedLinks = getGuideLinks(page.slug);

  return (
    <>
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
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">Convert intent</span>
          <h2 style={{ margin: 0 }}>Turn this guide into a same-day practice action</h2>
          <p className="practice-copy" style={{ margin: 0 }}>
            Guide visitors usually arrive with a specific problem, not a buying decision yet. The
            page performs better when it solves the problem clearly and then offers one concrete
            next action with low friction.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <AdSenseUnit />

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
