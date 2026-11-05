import {
  PageHero,
  PageSection,
  PageCTA,
  PublicButton,
} from "@/components/public/page-primitives";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const reviewGroups = [
  {
    title: "For learners targeting a higher band",
    points: [
      "The transcript view makes it easier to see where the answer lost structure.",
      "Retrying the same prompt turns vague feedback into a specific revision.",
      "Short AI practice can support, but does not replace, lessons or official assessment.",
    ],
  },
  {
    title: "Teachers and small schools",
    points: [
      "The class workflow is useful between lessons when students need extra speaking practice.",
      "Homework and replay give a clearer picture of who is progressing and who is stalling.",
      "Students can record and review independently before the next live lesson.",
    ],
  },
  {
    title: "Self-study learners",
    points: [
      "Daily speaking becomes more realistic when the feedback loop is short.",
      "A stronger sample answer shows how a response can be developed.",
      "The dashboard keeps the next task visible instead of leaving practice to guesswork.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Review SpeakAce by Use Case",
  description:
    "Review SpeakAce features for IELTS and TOEFL self-study, band improvement, and teacher workflows before choosing a plan.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Review SpeakAce by Use Case",
    description:
      "Inspect SpeakAce workflows for self-study learners and teachers without anonymous testimonial claims.",
    url: `${siteConfig.domain}/reviews`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function ReviewsPage() {
  return (
    <main className="public-container">
      <PageHero
        eyebrow="Product review"
        title="See how the practice fits your day."
        description="Explore the learner and teacher workflows, then try a prompt with your own answer. These are product use cases, rather than customer testimonials."
        actions={
          <>
            <PublicButton href="/app/practice">
              Try a free practice
            </PublicButton>
            <PublicButton href="/teacher-demo" secondary>
              Explore the class demo
            </PublicButton>
          </>
        }
      />
      <PageSection
        eyebrow="Three ways to practise"
        title="Choose the workflow you want to examine."
      >
        <div className="marketing-reading-features">
          {reviewGroups.map((group, index) => (
            <article key={group.title}>
              <span>0{index + 1}</span>
              <h3>{group.title}</h3>
              <ul className="seo-bullet-list">
                {group.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PageSection>
      <PageCTA
        title="Try the workflow on your own answer."
        description="Start with Free; compare the daily allowances and payment terms when you need more room."
      >
        <PublicButton href="/app/practice">Start free practice</PublicButton>
        <PublicButton href="/pricing" secondary>
          Compare plans
        </PublicButton>
      </PageCTA>
    </main>
  );
}
