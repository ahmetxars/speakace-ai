import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { seoTopicPages } from "@/lib/seo-topics";

export function generateStaticParams() {
  return seoTopicPages.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = seoTopicPages.find((item) => item.slug === slug);
  if (!topic) return {};

  return {
    title: `${topic.title} | IELTS Speaking Topic`,
    description: `${topic.prompt} Practice it with structure, examples, and AI-powered retry flow on SpeakAce.`,
    alternates: {
      canonical: `/ielts-speaking-topics/${topic.slug}`
    },
    openGraph: {
      title: `${topic.title} | SpeakAce`,
      description: `${topic.prompt} Practice it with clearer structure and stronger speaking flow.`,
      url: `${siteConfig.domain}/ielts-speaking-topics/${topic.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function TopicDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = seoTopicPages.find((item) => item.slug === slug);
  if (!topic) notFound();

  const related = seoTopicPages.filter((item) => item.slug !== topic.slug).slice(0, 4);

  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">IELTS topic page</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", lineHeight: 0.96 }}>{topic.title}</h1>
          <p>{topic.prompt}</p>
        </div>

        <article className="card" style={{ padding: "1.4rem", display: "grid", gap: "1rem" }}>
          <div className="pill" style={{ width: "fit-content" }}>Part 2 speaking practice</div>
          <div>
            <h2 style={{ marginBottom: "0.6rem" }}>How to answer this topic better</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>{topic.angle}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>Simple structure</strong>
            <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>{topic.tip}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>Why practice this inside SpeakAce</strong>
            <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
              You can record an answer, review the transcript, compare it with a stronger sample
              answer, and retry the same prompt without losing the main idea.
            </p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.07)", display: "grid", gap: "0.7rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
              <strong>Sample Band {topic.sampleBand} answer</strong>
              <span className="pill">Estimated Band {topic.sampleBand}</span>
            </div>
            <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.8 }}>{topic.sampleAnswer}</p>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>{topic.sampleWhy}</p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              Practice this topic
            </Link>
            <Link className="button button-secondary" href="/pricing">
              Unlock Plus
            </Link>
          </div>
        </article>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">Related topics</span>
            <h2>More IELTS speaking topics</h2>
          </div>
          <div className="marketing-grid">
            {related.map((item) => (
              <article key={item.slug} className="card feature-card">
                <h3>{item.title}</h3>
                <p>{item.tip}</p>
                <Link className="button button-secondary" href={`/ielts-speaking-topics/${item.slug}`}>
                  Open topic
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
