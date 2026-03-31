import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const stories = [
  {
    title: "From short answers to structured speaking",
    profile: "Self-study IELTS learner",
    result: "Used transcript review and retry history to stop giving one-line answers.",
    takeaway: "The strongest change came from adding one reason and one example to every response."
  },
  {
    title: "A teacher workflow for between-lesson practice",
    profile: "Small-group language coach",
    result: "Used class tracking, homework, and teacher notes to keep students active between classes.",
    takeaway: "Homework visibility and repeat prompts gave the class a cleaner practice routine."
  },
  {
    title: "Mock-style repetition before the real test",
    profile: "TOEFL retake student",
    result: "Used simulation mode and improved answers to create a more exam-like speaking rhythm.",
    takeaway: "The biggest lift came from building calmer delivery under time pressure."
  }
];

export const metadata: Metadata = {
  title: "SpeakAce Case Studies | IELTS Speaking Practice",
  description:
    "See how learners and teachers use SpeakAce to improve speaking structure, fluency, and confidence with AI feedback.",
  alternates: {
    canonical: `${siteConfig.domain}/case-studies`
  }
};

export default function CaseStudiesPage() {
  return (
    <main className="page-shell seo-page">
      <section className="card seo-hero">
        <span className="eyebrow">Proof and examples</span>
        <h1>How learners and teachers use SpeakAce in real practice routines</h1>
        <p>
          These examples show the practical value of transcript review, retries, teacher notes, and mock-style
          speaking repetition.
        </p>
      </section>

      <section className="seo-section">
        <div className="seo-grid">
          {stories.map((story) => (
            <article key={story.title} className="card seo-card">
              <span className="eyebrow">{story.profile}</span>
              <h2>{story.title}</h2>
              <p>{story.result}</p>
              <p>
                <strong>What changed:</strong> {story.takeaway}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card seo-cta-card">
        <h2>Turn practice into a visible improvement loop</h2>
        <p>Practice, review, retry, and watch your speaking become more structured and more confident.</p>
        <div className="hero-actions">
          <Link href="/app/practice" className="button button-primary">
            Start practicing
          </Link>
          <Link href="/pricing" className="button button-secondary">
            View plans
          </Link>
        </div>
      </section>
    </main>
  );
}
