import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { blogPosts } from "@/lib/marketing-content";
import { commerceConfig } from "@/lib/commerce";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.domain}/blog/${post.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.domain },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.domain}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${siteConfig.domain}/blog/${post.slug}` }
    ]
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: `${siteConfig.domain}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "SpeakAce AI"
    },
    publisher: {
      "@type": "Organization",
      name: "SpeakAce AI"
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Blog</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 0.98 }}>{post.title}</h1>
          <p>{post.description}</p>
        </div>

        <article className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link href="/blog" className="pill">Blog</Link>
            <Link href="/pricing" className="pill">Pricing</Link>
            <Link href="/app/practice" className="pill">Practice</Link>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.85 }}>{post.intro}</p>
          {post.sections.map((section) => (
            <section key={section.title} style={{ marginTop: "1.8rem" }}>
              <h2 style={{ marginBottom: "0.7rem" }}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={{ color: "var(--muted)", lineHeight: 1.85 }}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch" style={{ padding: "1.4rem" }}>
            <h2 style={{ marginBottom: "0.7rem" }}>Practice with SpeakAce</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              Use AI feedback, transcript review, pronunciation analysis, and speaking test
              simulation to build better IELTS speaking answers.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <a className="button button-primary" href="/app/practice">Start speaking practice</a>
              <a className="button button-secondary" href={commerceConfig.plusCheckoutPath}>Unlock Plus</a>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">Read next</span>
            <h2>More IELTS speaking practice guides</h2>
          </div>
          <div className="marketing-grid">
            {relatedPosts.map((item) => (
              <article key={item.slug} className="card feature-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link className="button button-secondary" href={`/blog/${item.slug}`}>
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Keep the visitor moving forward</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              If this article matched the search intent, the next best step is a focused resource
              page or a real speaking task inside the product.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/resources">
                Open resources
              </Link>
              <Link className="button button-secondary" href="/ielts-band-score-guide">
                Band score guide
              </Link>
              <Link className="button button-secondary" href="/ielts-speaking-topics">
                IELTS topics
              </Link>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>
    </>
  );
}
