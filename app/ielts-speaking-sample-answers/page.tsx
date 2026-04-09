import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/marketing-content";
import { seoTopicPages } from "@/lib/seo-topics";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Sample Answers",
  description:
    "Explore IELTS speaking sample answers, cue card ideas, and transcript-driven practice pages for better score growth.",
  alternates: { canonical: "/ielts-speaking-sample-answers" },
  openGraph: {
    title: "IELTS Speaking Sample Answers | SpeakAce",
    description:
      "Read IELTS speaking sample answers and move into AI-supported speaking practice on SpeakAce.",
    url: `${siteConfig.domain}/ielts-speaking-sample-answers`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function IeltsSpeakingSampleAnswersPage() {
  const relatedBlogs = blogPosts.filter((post) => post.slug.includes("sample") || post.slug.includes("cue-card")).slice(0, 4);

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">Sample answers</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
            IELTS speaking sample answers that actually lead into practice.
          </h1>
          <p>
            Good sample answers help most when they move learners from reading into speaking. This
            page connects answer ideas with real prompts and retry-based improvement.
          </p>
        </div>

        <div className="marketing-grid">
          {seoTopicPages.slice(0, 6).map((item) => (
            <article key={item.slug} className="card feature-card">
              <h2 style={{ fontSize: "1.3rem" }}>{item.title}</h2>
              <p>{item.angle}</p>
              <p className="practice-meta">{item.tip}</p>
              <Link className="button button-secondary" href={`/ielts-speaking-topics/${item.slug}`}>
                Open sample topic
              </Link>
            </article>
          ))}
        </div>

        {relatedBlogs.length ? (
          <section>
            <div className="section-head">
              <span className="eyebrow">Related guides</span>
              <h2>More examples and structure tips</h2>
            </div>
            <div className="marketing-grid">
              {relatedBlogs.map((post) => (
                <article key={post.slug} className="card feature-card">
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <Link className="button button-secondary" href={`/blog/${post.slug}`}>
                    Read guide
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
