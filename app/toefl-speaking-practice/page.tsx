import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "TOEFL Speaking AI Practice | SpeakAce",
  description:
    "Practice TOEFL speaking online with AI feedback, integrated speaking tasks, transcripts, response timers, and estimated score support.",
  alternates: {
    canonical: "/toefl-speaking-practice"
  },
  keywords: [
    "TOEFL speaking practice",
    "TOEFL speaking AI",
    "AI English speaking practice",
    "TOEFL integrated speaking",
    "TOEFL speaking timer",
    "speaking score improvement"
  ]
};

export default function TOEFLPage() {
  return (
    <>
      <MarketingPage
        eyebrow="TOEFL speaking AI"
        title="TOEFL speaking AI practice with timed tasks, transcript review, and faster retries."
        description="Prepare for TOEFL speaking with AI feedback that helps you organize integrated answers, control timing, and retry weak responses with a clearer structure."
        focus="This landing page now targets TOEFL speaking AI intent more directly, with integrated-task language, timer relevance, and score-improvement positioning designed to convert search visitors into practice users."
        ctaHref="/app/practice"
      />
    </>
  );
}
