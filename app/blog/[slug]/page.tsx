import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { blogPosts } from "@/lib/marketing-content";

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
    keywords: post.keywords
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
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
            <a className="button button-primary" href="/app/practice">Start speaking practice</a>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      </main>
    </>
  );
}
