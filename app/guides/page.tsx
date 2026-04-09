import type { Metadata } from "next";
import Link from "next/link";
import { guidePages } from "@/lib/seo-growth";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Guides",
  description:
    "Read practical IELTS speaking guides for band growth, pronunciation, fluency, answer structure, and vocabulary improvement.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "IELTS Speaking Guides | SpeakAce",
    description:
      "A practical hub of IELTS speaking guides built for score-focused learners and self-study routines.",
    url: `${siteConfig.domain}/guides`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function GuidesHubPage() {
  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Guides</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            Practical IELTS speaking guides for clearer, stronger answers.
          </h1>
          <p>
            Read practical guides for fluency, answer structure, pronunciation, timing, and band
            score improvement.
          </p>
        </div>
        <div className="marketing-grid">
          {guidePages.map((item) => (
            <article key={item.slug} className="card feature-card">
              <h2 style={{ fontSize: "1.35rem" }}>{item.title}</h2>
              <p>{item.description}</p>
              <Link className="button button-secondary" href={`/guides/${item.slug}`}>
                Open guide
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
