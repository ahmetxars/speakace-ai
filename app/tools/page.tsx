import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import { toolPages } from "@/lib/seo-growth";

export const metadata: Metadata = {
  title: "Free IELTS Speaking Tools",
  description:
    "Explore free IELTS speaking tools, study-plan ideas, topic generators, and score-focused speaking pages.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free IELTS Speaking Tools | SpeakAce",
    description:
      "A hub of free IELTS speaking tools and top-of-funnel pages designed to pull learners into practice.",
    url: `${siteConfig.domain}/tools`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function ToolsHubPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Tools</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            Free tool-style pages that attract search traffic before a user is ready to buy.
          </h1>
          <p>
            Tool pages are useful because many visitors want a quick answer first. If the page is
            helpful, it can then pull them toward practice and eventually Plus.
          </p>
        </div>
        <div className="marketing-grid">
          {toolPages.map((item) => (
            <article key={item.slug} className="card feature-card">
              <h2 style={{ fontSize: "1.35rem" }}>{item.title}</h2>
              <p>{item.description}</p>
              <Link className="button button-secondary" href={`/tools/${item.slug}`}>
                Open tool page
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
