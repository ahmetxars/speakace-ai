import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getBlogChromeCopy, getFeaturedBlogPosts } from "@/lib/blog-content";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS and TOEFL Speaking Blog",
  description:
    "Read longer articles about IELTS and TOEFL speaking, sample answers, speaking routines, score improvement, and test-day preparation.",
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    title: "IELTS and TOEFL Speaking Blog | SpeakAce",
    description:
      "Long-form articles about speaking strategy, sample answers, confidence, note-taking, and study plans.",
    url: `${siteConfig.domain}/blog`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default async function BlogIndexPage() {
  const language = await getServerLanguage();
  const chrome = getBlogChromeCopy(language);
  const { featured, firstPath, secondPath, all } = getFeaturedBlogPosts(language);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SpeakAce Blog",
    url: `${siteConfig.domain}/blog`,
    blogPost: all.map((post) => ({
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
          <span className="eyebrow">{chrome.cta.blog}</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            {chrome.labels.blogTitle}
          </h1>
          <p>{chrome.labels.blogDescription}</p>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">{chrome.cta.featured}</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{featured.title}</h2>
              <p className="practice-copy">{chrome.labels.featuredDescription}</p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href={`/blog/${featured.slug}`}>
                {chrome.cta.read}
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{chrome.cta.readingTracks}</span>
            <h2>{chrome.labels.latestDescription}</h2>
          </div>
          <div className="marketing-grid">
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{chrome.labels.startPath}</div>
              <h3 style={{ fontSize: "1.4rem" }}>{firstPath[0]?.title}</h3>
              <p>{chrome.labels.featuredDescription}</p>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {firstPath.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="button button-secondary">
                    {post.title}
                  </Link>
                ))}
              </div>
            </article>
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{chrome.labels.advancedPath}</div>
              <h3 style={{ fontSize: "1.4rem" }}>{secondPath[0]?.title}</h3>
              <p>{chrome.labels.latestDescription}</p>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {secondPath.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="button button-secondary">
                    {post.title}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{chrome.cta.latest}</span>
            <h2>{all.length} articles</h2>
          </div>
          <div className="marketing-grid">
            {all.map((post) => (
              <article key={post.slug} className="card feature-card">
                <div className="pill" style={{ marginBottom: "0.8rem" }}>{post.keywords[0]}</div>
                <h2 style={{ fontSize: "1.45rem", marginBottom: "0.7rem" }}>{post.title}</h2>
                <p>{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="button button-primary" style={{ marginTop: "0.7rem" }}>
                  {chrome.cta.readMore}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      </main>
    </>
  );
}
