import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { SiteHeader } from "@/components/site-header";
import { blogPosts } from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

const resourceCards: Array<{
  href: Route;
  title: string;
  description: string;
}> = [
  {
    href: "/ielts-speaking-topics",
    title: "IELTS speaking topics",
    description: "Topic-led practice ideas for students who search by theme before they practice."
  },
  {
    href: "/ielts-band-score-guide",
    title: "IELTS band score guide",
    description: "A practical guide to what moves a speaking answer closer to a higher band score."
  },
  {
    href: "/ielts-speaking-part-1-questions",
    title: "IELTS Part 1 questions",
    description: "Faster answer patterns for short questions, fluency, and natural openings."
  },
  {
    href: "/ielts-speaking-part-2-topics",
    title: "IELTS Part 2 topics",
    description: "Cue-card strategy, idea planning, and story flow for stronger long turns."
  },
  {
    href: "/ielts-speaking-part-3-questions",
    title: "IELTS Part 3 questions",
    description: "More structured discussion answers with clearer examples and deeper thinking."
  },
  {
    href: "/english-speaking-confidence",
    title: "Speaking confidence",
    description: "Confidence-building guidance for learners who want calmer, clearer speaking."
  },
  {
    href: "/free-ielts-speaking-test",
    title: "Free IELTS speaking test",
    description: "A simple entry point for visitors who want to try the product before paying."
  },
  {
    href: "/weekly-ielts-speaking-challenge",
    title: "Weekly IELTS speaking challenge",
    description: "A habit-based challenge page that gives visitors a repeatable reason to return."
  },
  {
    href: "/ielts-speaking-sample-answers",
    title: "IELTS speaking sample answers",
    description: "A practical bridge between answer examples and real speaking practice."
  },
  {
    href: "/compare",
    title: "Compare speaking tools",
    description: "Comparison pages that target visitors who are already evaluating products."
  },
  {
    href: "/tools",
    title: "Free IELTS speaking tools",
    description: "Simple calculators, generators, and practice helpers learners can use before full speaking sessions."
  },
  {
    href: "/guides",
    title: "IELTS speaking guides",
    description: "Improvement-focused guide pages for fluency, structure, vocabulary, and pronunciation."
  }
];

const featuredCollections: Array<{
  title: string;
  description: string;
  href: Route;
}> = [
  {
    title: "Guides and strategy",
    description: "Clear articles for band score improvement, fluency, structure, and pronunciation.",
    href: "/guides"
  },
  {
    title: "Sample answers and topics",
    description: "Part 1, Part 2, and Part 3 practice content with usable answer ideas.",
    href: "/ielts-speaking-sample-answers"
  },
  {
    title: "Free tools and generators",
    description: "Simple tools learners can use before they move into full speaking practice.",
    href: "/tools"
  },
  {
    title: "Practice and comparison pages",
    description: "Free test flows, weekly challenge pages, and product comparisons for learners exploring options.",
    href: "/compare"
  }
];

export const metadata: Metadata = {
  title: "IELTS Speaking Resources",
  description:
    "Explore IELTS speaking resources, topic guides, band score strategy, and AI practice content built to improve score and fluency.",
  alternates: {
    canonical: "/resources"
  },
  openGraph: {
    title: "IELTS Speaking Resources | SpeakAce",
    description:
      "A resource hub for IELTS speaking practice, band score guidance, topic ideas, and task-specific improvement.",
    url: `${siteConfig.domain}/resources`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function ResourcesPage() {
  const featuredArticle = blogPosts[0];
  const popularArticles = blogPosts.slice(1, 7);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SpeakAce Resources",
    url: `${siteConfig.domain}/resources`
  };

  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Resources</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            IELTS speaking resources, guides, and practice ideas
          </h1>
          <p>
            Explore topic pages, band score guides, sample answers, and practical articles that
            help you move from reading into real speaking practice.
          </p>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">Collections</span>
            <h2>Start with the content format that fits your goal</h2>
          </div>
          <div className="marketing-grid">
            {featuredCollections.map((collection) => (
              <article key={collection.href} className="card feature-card">
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link className="button button-secondary" href={collection.href}>
                  Explore collection
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">Featured article</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{featuredArticle.title}</h2>
              <p className="practice-copy">{featuredArticle.description}</p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href={`/blog/${featuredArticle.slug}`}>
                Read featured article
              </Link>
              <Link className="button button-secondary" href="/blog">
                Open blog
              </Link>
            </div>
          </div>
        </section>

        <div className="marketing-grid">
          {resourceCards.map((card) => (
            <article key={card.href} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>Resource</div>
              <h2 style={{ fontSize: "1.4rem" }}>{card.title}</h2>
              <p>{card.description}</p>
              <Link className="button button-primary" href={card.href}>
                Open guide
              </Link>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">Topic of the day</span>
            <h2>One easy prompt to pull visitors into practice</h2>
          </div>
          <div className="card institution-cta">
            <div>
              <h2 style={{ margin: "0 0 0.5rem" }}>Describe a useful object you use often</h2>
              <p className="practice-copy">
                A simple daily topic works well because it gives people a low-friction reason to
                record one answer and see the transcript.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/ielts-speaking-topics/describe-a-useful-object">
                Open topic page
              </Link>
              <Link className="button button-secondary" href="/app/practice">
                Start free practice
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card lead-capture-card">
            <div>
              <span className="eyebrow">Free checklist</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Give new visitors one easy reason to stay</h2>
              <p className="practice-copy">
                A free checklist and welcome email create a softer first conversion for visitors who are not ready to buy yet.
              </p>
            </div>
            <div className="lead-capture-actions">
              <LeadCaptureForm source="resources_lead" />
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">Reading paths</span>
            <h2>Popular articles readers usually open first</h2>
            <p>
              Strong resource hubs usually give visitors a simple first path instead of showing an endless wall of links.
            </p>
          </div>
          <div className="marketing-grid">
            {popularArticles.map((post) => (
              <article key={post.slug} className="card feature-card">
                <div className="pill" style={{ marginBottom: "0.8rem" }}>Article</div>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <Link className="button button-secondary" href={`/blog/${post.slug}`}>
                  Read article
                </Link>
              </article>
            ))}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <Link className="button button-primary" href="/blog">
              Open all articles
            </Link>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">Next step</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Move from reading into practice</h2>
              <p className="practice-copy">
                The strongest learning path is simple: read one focused guide, try one timed
                speaking task, review the transcript, then repeat with clearer structure.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-secondary" href="/app/practice">
                Start practice
              </Link>
              <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus">
                Unlock Plus
              </a>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </main>
    </>
  );
}
