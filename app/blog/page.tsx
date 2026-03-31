import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { blogPosts } from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Blog",
  description:
    "Read simple guides about IELTS speaking practice, AI speaking tools, pronunciation, band score improvement, and speaking test strategy.",
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    title: "IELTS Speaking Blog | SpeakAce",
    description:
      "Read practical IELTS speaking practice guides designed to rank for search and convert learners into users.",
    url: `${siteConfig.domain}/blog`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function BlogIndexPage() {
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SpeakAce Blog",
    url: `${siteConfig.domain}/blog`,
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${siteConfig.domain}/blog/${post.slug}`
    }))
  };

  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Blog</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            IELTS speaking practice content built to rank and convert
          </h1>
          <p>
            Read practical articles about IELTS speaking practice, AI English speaking practice,
            speaking test simulation, and score improvement.
          </p>
        </div>

        <div className="marketing-grid">
          {blogPosts.map((post) => (
            <article key={post.slug} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{post.keywords[0]}</div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.7rem" }}>{post.title}</h2>
              <p>{post.description}</p>
              <Link href={`/blog/${post.slug}`} className="button button-primary" style={{ marginTop: "0.7rem" }}>
                Read article
              </Link>
            </article>
          ))}
        </div>
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Start from content. Stay for the feedback loop.</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              Blog traffic helps discovery. Real value comes when visitors move into timed speaking
              tasks, transcript review, and a stronger retry habit.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/resources">
                Open resource hub
              </Link>
              <Link className="button button-secondary" href="/app/practice">
                Start practice
              </Link>
            </div>
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      </main>
    </>
  );
}
