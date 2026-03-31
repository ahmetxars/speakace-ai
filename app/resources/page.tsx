import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
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
            IELTS speaking resources that turn search traffic into real practice
          </h1>
          <p>
            These pages are built for students searching for faster score improvement, better
            structure, stronger fluency, and more focused IELTS speaking practice.
          </p>
        </div>

        <div className="marketing-grid">
          {resourceCards.map((card) => (
            <article key={card.href} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>High-intent SEO</div>
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
            <span className="eyebrow">Blog</span>
            <h2>More articles that support conversion</h2>
          </div>
          <div className="marketing-grid">
            {blogPosts.slice(0, 6).map((post) => (
              <article key={post.slug} className="card feature-card">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <Link className="button button-secondary" href={`/blog/${post.slug}`}>
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card institution-cta">
            <div>
              <span className="eyebrow">Next step</span>
              <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Move from reading into practice</h2>
              <p className="practice-copy">
                The strongest conversion path is simple: high-intent guide, timed speaking task,
                transcript review, then Plus upgrade when the learner wants more repetitions.
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
