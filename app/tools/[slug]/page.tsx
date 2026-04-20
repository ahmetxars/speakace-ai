import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolWorkbench } from "@/components/tool-workbench";
import { siteConfig } from "@/lib/site";
import { toolPages } from "@/lib/seo-growth";
import { getToolVisual } from "@/lib/tool-visuals";

function getToolLinks(slug: string) {
  if (slug.includes("toefl")) {
    return [
      { href: "/speaking-timer", label: "Open timer" },
      { href: "/toefl-speaking-practice", label: "TOEFL AI practice" }
    ];
  }
  if (slug.includes("cue-card")) {
    return [
      { href: "/ielts-speaking-part-2-topics", label: "Open Part 2 guide" },
      { href: "/ielts-speaking-topics", label: "Browse topic list" }
    ];
  }
  if (slug.includes("replay")) {
    return [
      { href: "/app/practice", label: "Start a new session" },
      { href: "/pricing", label: "Unlock full review" }
    ];
  }
  if (slug.includes("calculator") || slug.includes("checker")) {
    return [
      { href: "/ielts-band-estimator", label: "Try free estimator" },
      { href: "/free-ielts-speaking-test", label: "Take free test" }
    ];
  }
  return [
    { href: "/app/practice", label: "Start practice" },
    { href: "/resources", label: "Open resources" }
  ];
}

export function generateStaticParams() {
  return toolPages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = toolPages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/tools/${page.slug}` },
    openGraph: {
      title: `${page.title} | SpeakAce`,
      description: page.description,
      url: `${siteConfig.domain}/tools/${page.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function ToolDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = toolPages.find((item) => item.slug === slug);
  if (!page) notFound();
  const visual = getToolVisual(page.slug);
  const relatedLinks = getToolLinks(page.slug);

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Free tool</span>
          <div className="tool-card-visual" aria-hidden="true" style={{ margin: "0.25rem 0 0.75rem" }}>
            <span className="tool-card-icon">{visual.emoji}</span>
            <span className="pill">{visual.badge}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.6rem)", lineHeight: 0.96 }}>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <ToolWorkbench slug={page.slug} title={page.title} />
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">Intent match</span>
          <h2 style={{ margin: 0 }}>This page should turn search intent into one clear next step</h2>
          <p className="practice-copy" style={{ margin: 0 }}>
            Visitors landing on &quot;{page.title}&quot; usually want something quick and useful first. The
            best conversion path is simple: give the tool signal immediately, then move the user
            into one real speaking action while their motivation is still high.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              {page.actionLabel ?? "Use tool"}
            </Link>
            {relatedLinks.map((item) => (
              <Link key={item.href} className="button button-secondary" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="marketing-grid">
          {page.bullets.map((bullet) => (
            <article key={bullet} className="card feature-card">
              <h2 style={{ fontSize: "1.25rem" }}>Practical note</h2>
              <p>{bullet}</p>
            </article>
          ))}
        </div>
        <div className="card institution-cta">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{page.cta}</h2>
            <p className="practice-copy">
              Use the tool as a simple entry point, then move into one real speaking attempt while
              the idea is still fresh.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              {page.actionLabel ?? "Start practice"}
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
