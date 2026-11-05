import type { Metadata } from "next";
import {
  PageHero,
  PageSection,
  PageCTA,
  PublicButton,
} from "@/components/public/page-primitives";
import { FileText, Timer, UsersRound } from "lucide-react";
const scenarios = [
  {
    profile: "Independent IELTS study",
    title: "Develop a short answer",
    body: "Read your transcript and look for a point that needs an example. Keep the prompt and try a more specific answer.",
    steps: [
      "Answer one question before writing a script.",
      "Pick a general phrase in your transcript.",
      "Replace it with a concrete place, reason or memory.",
    ],
    icon: FileText,
  },
  {
    profile: "Between-lesson teaching",
    title: "Bring practice into the next lesson",
    body: "Assign a speaking task and review the submitted attempts. Use the evidence to choose a focus for your next conversation with the class.",
    steps: [
      "Create a class and share its invite code.",
      "Assign a focused task to your learners.",
      "Review attempts and add a teacher note.",
    ],
    icon: UsersRound,
  },
  {
    profile: "Timed TOEFL-style practice",
    title: "Work on pacing under a time limit",
    body: "Use a timed prompt to notice where your answer becomes rushed. Review your recording, choose one change and try the same task again.",
    steps: [
      "Choose the speaking task you want to rehearse.",
      "Leave time for a reason and a supporting example.",
      "Compare your attempts for timing and structure.",
    ],
    icon: Timer,
  },
];
export const metadata: Metadata = {
  title: "SpeakAce Practice Scenarios | IELTS and TOEFL",
  description:
    "Illustrative practice scenarios for independent learners, teachers and timed speaking. These are product examples, not verified customer case studies.",
  alternates: { canonical: "/case-studies" },
};
export default function CaseStudiesPage() {
  return (
    <main className="public-container">
      <PageHero
        eyebrow="Illustrative practice scenarios"
        title="A useful routine starts with one clear task."
        description="Explore three ways to use the practice tools. These are authored product scenarios; they do not report customer results or promise a score increase."
      />
      <PageSection
        eyebrow="Choose your routine"
        title="An answer, a review, a next attempt."
      >
        <div className="public-resource-grid">
          {scenarios.map((s, index) => (
            <article className="public-resource-card" key={s.profile}>
              <div className="public-card-topline">
                <span>0{index + 1}</span>
                <s.icon size={23} />
              </div>
              <span className="public-card-category">{s.profile}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <ol className="seo-bullet-list">
                {s.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </PageSection>
      <PageCTA
        title="Test the routine with your own answer."
        description="Use a free practice session or explore the illustrative teacher demo."
      >
        <PublicButton href="/app/practice">Start free practice</PublicButton>
        <PublicButton href="/teacher-demo" secondary>
          Explore the class demo
        </PublicButton>
      </PageCTA>
    </main>
  );
}
