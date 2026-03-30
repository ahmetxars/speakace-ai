import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { blogPosts } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "IELTS Speaking Blog",
  description:
    "Read simple guides about IELTS speaking practice, AI speaking tools, pronunciation, band score improvement, and speaking test strategy.",
  alternates: {
    canonical: "/blog"
  }
};

export default function BlogIndexPage() {
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
      </main>
    </>
  );
}
