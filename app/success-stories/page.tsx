import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const stories = [
  {
    title: "From random speaking to a daily score-focused routine",
    body: "Students who improve faster usually have one thing in common: they stop guessing what to practice next."
  },
  {
    title: "Why transcript review changes self-study",
    body: "The transcript turns vague speaking advice into visible mistakes and faster retry opportunities."
  },
  {
    title: "How schools can use SpeakAce between lessons",
    body: "Teacher dashboards, homework, risk alerts, and progress summaries help classes keep momentum outside lesson hours."
  }
];

export const metadata: Metadata = {
  title: "SpeakAce Practice Workflows",
  description:
    "Explore illustrative SpeakAce workflows for IELTS and TOEFL speaking routines, transcript review, and teacher follow-up.",
  alternates: { canonical: "/success-stories" },
  openGraph: {
    title: "SpeakAce Practice Workflows",
    description:
      "Illustrative workflows showing how SpeakAce can support self-study and teacher follow-up.",
    url: `${siteConfig.domain}/success-stories`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function SuccessStoriesPage() {
  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Illustrative workflows</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 4.8rem)", lineHeight: 0.95 }}>
            Why SpeakAce can feel worth paying for
          </h1>
          <p>
            These are product-use examples, not customer testimonials. SpeakAce is built around
            repeat attempts, visible transcripts, faster feedback, and clearer next steps.
          </p>
        </div>

        <div className="marketing-grid">
          {stories.map((story) => (
            <article key={story.title} className="card testimonial-card">
              <h2 style={{ fontSize: "1.45rem" }}>{story.title}</h2>
              <p style={{ lineHeight: 1.8 }}>{story.body}</p>
            </article>
          ))}
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card quick-pitch">
            <h2 style={{ marginBottom: "0.7rem" }}>The best proof is your own practice data</h2>
            <p className="practice-copy" style={{ marginBottom: "1rem" }}>
              Start free, see how the workflow feels, then unlock Plus when you want more daily
              volume and a deeper improvement loop.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">
                Start practice
              </Link>
              <Link className="button button-secondary" href="/pricing">
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
