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
  const featured = blogPosts[0];
  const starterPosts = blogPosts.slice(1, 5);
  const advancedPosts = blogPosts.slice(5, 9);
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
            Practical IELTS speaking articles for better answers and better scores
          </h1>
          <p>
            Read practical articles about IELTS speaking practice, sample answers, fluency,
            pronunciation, and daily study strategy.
          </p>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">Featured</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{featured.title}</h2>
              <p className="practice-copy">{featured.description}</p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href={`/blog/${featured.slug}`}>
                Read featured article
              </Link>
              <Link className="button button-secondary" href="/resources">
                Open resources
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="marketing-grid">
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Start here</div>
              <h2 style={{ fontSize: "1.4rem" }}>New to IELTS speaking?</h2>
              <p>Begin with band score guides, common mistakes, and simple routines you can repeat every day.</p>
              <Link href="/guides" className="button button-secondary">
                Open guides
              </Link>
            </article>
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Most useful</div>
              <h2 style={{ fontSize: "1.4rem" }}>Looking for answer ideas?</h2>
              <p>Use sample answers, cue card examples, and topic pages when you want to practice more naturally.</p>
              <Link href="/ielts-speaking-sample-answers" className="button button-secondary">
                See sample answers
              </Link>
            </article>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">Reading paths</span>
            <h2>Choose a simpler first reading track</h2>
            <p>Readers convert better when the content path feels curated instead of random.</p>
          </div>
          <div className="marketing-grid">
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Starter path</div>
              <h3>Build a cleaner base first</h3>
              <p>Read about structure, confidence, fillers, and simple daily routines before chasing advanced vocabulary.</p>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {starterPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="button button-secondary">
                    {post.title}
                  </Link>
                ))}
              </div>
            </article>
            <article className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Advanced path</div>
              <h3>Push score quality higher</h3>
              <p>Move into score jumps, stronger examples, natural transitions, and more mature answer control.</p>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {advancedPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="button button-secondary">
                    {post.title}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </section>

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
            <h2 style={{ marginBottom: "0.7rem" }}>Read one article, then try one real speaking task.</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              The blog should help you learn faster, but real improvement comes when you record,
              review your transcript, and retry with better structure.
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
