import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const stories = [
  {
    profile: "Self-study IELTS learner",
    title: "From short answers to structured speaking",
    summary:
      "A learner used retry history, transcript review, and sample-answer comparison to stop giving one-line answers and start expanding naturally.",
    before: "Band 5.5-style responses with weak expansion and rushed endings.",
    after: "Band 6.0–6.5-style answers with clearer structure, one reason, and one example.",
    timeline: "3 weeks of repeat practice",
    actions: [
      "Reviewed every transcript after practice instead of moving on immediately.",
      "Repeated the same prompt after seeing where the answer became too short.",
      "Used a simple structure: answer, reason, example, closing idea."
    ],
    whatChanged:
      "The biggest lift came from learning how to extend one idea instead of adding random vocabulary."
  },
  {
    profile: "Small-group language coach",
    title: "A teacher workflow for between-lesson practice",
    summary:
      "A speaking coach used class tracking, homework, and teacher notes to keep students active between live lessons.",
    before: "Students practised irregularly and teachers could not see what happened between lessons.",
    after: "Homework, retries, and student output became visible and easier to discuss in class.",
    timeline: "First month of class usage",
    actions: [
      "Assigned short speaking tasks between lessons instead of broad homework.",
      "Tracked which prompts students retried and which answers stayed weak.",
      "Added notes after sessions to guide what the next lesson should focus on."
    ],
    whatChanged:
      "The class became easier to manage because practice moved from guesswork to visible speaking output."
  },
  {
    profile: "TOEFL retake student",
    title: "Mock-style repetition before the real test",
    summary:
      "A TOEFL student used simulation mode and improved answers to create a more exam-like speaking rhythm before a retake.",
    before: "Panicked delivery, rushed summaries, and unstable timing under pressure.",
    after: "More stable timing, better pacing, and clearer structure in timed answers.",
    timeline: "2 weeks before retake",
    actions: [
      "Practised timed tasks in sequence instead of isolated prompts.",
      "Reviewed pacing and content after each attempt, not just the final score.",
      "Repeated only the weakest task types until timing felt calmer."
    ],
    whatChanged:
      "The biggest lift came from making practice feel closer to the real exam instead of practising randomly."
  }
];

const outcomeCards = [
  {
    title: "Clearer answer structure",
    body: "Learners improve faster when every answer moves from short reaction to answer + reason + example."
  },
  {
    title: "Visible daily practice",
    body: "Teachers and students can both see whether practice is actually happening between lessons."
  },
  {
    title: "Calmer timed delivery",
    body: "Mock-style repetition helps learners speak with less panic and more control under time pressure."
  }
];

const workflowSteps = [
  {
    title: "1. Speak first",
    body: "Every case study starts with a real answer, not with reading theory for too long."
  },
  {
    title: "2. Review what broke",
    body: "The transcript, timing, and answer shape show exactly where the response became weak."
  },
  {
    title: "3. Retry with one fix",
    body: "Students improve faster when they retry one prompt with one clear change instead of starting from zero."
  },
  {
    title: "4. Track the pattern",
    body: "Teachers and learners can then see whether fluency, structure, and confidence are actually improving."
  }
];

export const metadata: Metadata = {
  title: "SpeakAce Case Studies | IELTS and TOEFL Speaking Examples",
  description:
    "See practical examples of how IELTS learners, TOEFL retake students, and teachers use SpeakAce to improve speaking structure, fluency, and consistency.",
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
          These examples show what happens when speaking practice becomes visible, repeatable, and easier to improve
          session by session.
        </p>
      </section>

      <section className="seo-section">
        <div className="seo-grid">
          {outcomeCards.map((item) => (
            <article key={item.title} className="card seo-card">
              <span className="eyebrow">Observed outcome</span>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-section">
        <div className="seo-grid">
          {stories.map((story) => (
            <article key={story.title} className="card seo-card">
              <span className="eyebrow">{story.profile}</span>
              <h2>{story.title}</h2>
              <p>{story.summary}</p>
              <p>
                <strong>Before:</strong> {story.before}
              </p>
              <p>
                <strong>After:</strong> {story.after}
              </p>
              <p>
                <strong>Timeline:</strong> {story.timeline}
              </p>
              <div className="card case-study-list-card">
                <strong>What they actually did</strong>
                <ul className="case-study-list">
                  {story.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
              <p>
                <strong>What changed:</strong> {story.whatChanged}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card seo-card">
        <span className="eyebrow">Shared pattern</span>
        <h2>What all strong improvement loops have in common</h2>
        <p>
          The strongest cases do not rely on motivation alone. They follow a simple rhythm: answer, review, retry, and
          then make the next attempt more deliberate.
        </p>
        <div className="seo-grid">
          {workflowSteps.map((step) => (
            <article key={step.title} className="card seo-card case-study-list-card">
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card seo-cta-card">
        <span className="eyebrow">Try the same workflow</span>
        <h2>Turn daily speaking practice into visible score improvement</h2>
        <p>
          Start with one timed answer, review the transcript, retry the same prompt, and make every practice session
          more useful.
        </p>
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
