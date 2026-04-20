import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Use Cue Cards for IELTS Speaking Part 2 | SpeakAce",
  description:
    "Learn how to use cue cards for IELTS Speaking Part 2 with better structure, story flow, prep notes, and stronger detail.",
  alternates: { canonical: "/ielts-speaking-part-2-topics" },
  openGraph: {
    title: "How to Use Cue Cards for IELTS Speaking Part 2 | SpeakAce",
    description:
      "Cue card strategy, prep guidance, and long-answer speaking flow for IELTS Speaking Part 2.",
    url: `${siteConfig.domain}/ielts-speaking-part-2-topics`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function Part2GuidePage() {
  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Part 2 guide</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", lineHeight: 0.96 }}>
            IELTS Speaking Part 2 becomes easier when you know how to use cue cards instead of improvising everything
          </h1>
          <p>
            The best cue card answers are not random stories. They usually follow a simple order:
            what it is, one clear moment, one concrete detail, and why it mattered.
          </p>
        </div>

        <div className="marketing-grid">
          {["Person", "Object", "Place", "Event", "Skill", "Experience"].map((item) => (
            <article key={item} className="card feature-card">
              <h2>Describe a {item.toLowerCase()}</h2>
              <p>
                This cue-card shape works better when you decide the main example early and keep
                each point easy to follow.
              </p>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>Train cue cards with a repeatable system</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              SpeakAce helps you practice Part 2 with cue-card style flow, notes, transcript review,
              and a better example answer after each attempt.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">
                Practice Part 2
              </Link>
              <Link className="button button-secondary" href="/ielts-speaking-topics">
                Open topic list
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
