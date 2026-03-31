import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { comparisonPages } from "@/lib/seo-growth";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compare IELTS Speaking Tools",
  description:
    "Compare SpeakAce with other AI speaking tools and see which product fits IELTS speaking practice best.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare IELTS Speaking Tools | SpeakAce",
    description:
      "Comparison pages for IELTS speaking apps, AI feedback tools, and school-ready speaking platforms.",
    url: `${siteConfig.domain}/compare`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function CompareHubPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Compare</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            Comparison pages that capture high-intent traffic close to buying.
          </h1>
          <p>
            These pages target visitors who are already comparing tools, which makes them closer to
            converting than a broad awareness article.
          </p>
        </div>

        <div className="marketing-grid">
          {comparisonPages.map((item) => (
            <article key={item.slug} className="card feature-card">
              <h2 style={{ fontSize: "1.35rem" }}>{item.title}</h2>
              <p>{item.description}</p>
              <Link className="button button-secondary" href={`/compare/${item.slug}`}>
                Open comparison
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
