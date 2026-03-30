import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "TOEFL Speaking Practice With AI",
  description:
    "Practice TOEFL speaking online with AI feedback, integrated speaking tasks, transcripts, and estimated speaking score support.",
  alternates: {
    canonical: "/toefl-speaking-practice"
  },
  keywords: [
    "TOEFL speaking practice",
    "TOEFL speaking AI",
    "AI English speaking practice",
    "TOEFL integrated speaking",
    "speaking score improvement"
  ]
};

export default function TOEFLPage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="TOEFL speaking practice"
        title="TOEFL speaking practice with AI transcript review and timed response drills."
        description="Prepare for TOEFL speaking tasks with response timers, transcript-based review, and feedback on delivery, language use, and topic development."
        focus="This page targets TOEFL-specific demand with integrated speaking language, timed independent tasks, and structured score-improvement messaging."
        ctaHref="/app/practice"
      />
    </>
  );
}
