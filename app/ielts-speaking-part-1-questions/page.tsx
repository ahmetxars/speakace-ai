import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Part 1 Questions",
  description:
    "Practice IELTS Speaking Part 1 questions with faster answer structure, better examples, and more natural fluency.",
  alternates: { canonical: "/ielts-speaking-part-1-questions" },
  openGraph: {
    title: "IELTS Speaking Part 1 Questions | SpeakAce",
    description:
      "A practical guide for IELTS Speaking Part 1 questions with better short-answer structure and practice flow.",
    url: `${siteConfig.domain}/ielts-speaking-part-1-questions`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function Part1GuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Part 1 guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", lineHeight: 0.96 }}>
            IELTS Speaking Part 1 questions reward fast, clear, natural answers
          </h1>
          <p>
            Part 1 is where many students either warm up well or lose confidence early. The best
            pattern is simple: answer directly, add one detail, and keep the rhythm natural.
          </p>
        </div>

        <div className="marketing-grid">
          {["Hometown", "Work or study", "Daily life", "Friends", "Technology", "Food"].map((item) => (
            <article key={item} className="card feature-card">
              <h2>{item}</h2>
              <p>
                Practice this topic by giving a direct answer first, then one short reason or
                example instead of stopping too early.
              </p>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Improve Part 1 through quick retries</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              Short-answer fluency improves fast when you can record, review, and retry the same
              question without waiting for manual correction.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">
                Practice Part 1
              </Link>
              <Link className="button button-secondary" href="/ielts-speaking-part-3-questions">
                Open Part 3 guide
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
