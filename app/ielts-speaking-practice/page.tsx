import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice with AI Feedback",
  description:
    "Practice IELTS speaking online with AI feedback, timed cue cards, transcript review, and estimated band score support.",
  alternates: {
    canonical: "/ielts-speaking-practice"
  },
  keywords: [
    "IELTS speaking practice",
    "IELTS speaking AI",
    "improve IELTS speaking score",
    "IELTS band score speaking",
    "speaking test simulator IELTS"
  ]
};

export default function IELTSPage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="IELTS speaking practice"
        title="IELTS speaking practice with AI feedback, timed cue cards, and transcript review."
        description="Train for IELTS Speaking Part 1, Part 2, and Part 3 online. Record answers, review transcripts, and improve fluency, coherence, and pronunciation."
        focus="This page targets IELTS-specific search intent with band-style speaking feedback, cue-card training, speaking simulation, and score-improvement messaging."
        ctaHref="/app/practice"
      />
    </>
  );
}
