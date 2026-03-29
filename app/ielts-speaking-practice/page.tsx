import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice With AI",
  description:
    "Practice IELTS speaking online with AI feedback, timed cue cards, transcript review, and estimated band-style scoring.",
  alternates: {
    canonical: "/ielts-speaking-practice"
  }
};

export default function IELTSPage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="IELTS speaking practice"
        title="IELTS speaking practice with AI feedback and timed cue-card drills."
        description="Train for IELTS Speaking Part 1, Part 2, and Part 3 online. Record answers, review transcripts, and improve fluency, coherence, and pronunciation."
        focus="This page targets IELTS-specific search intent by focusing on band-style feedback, cue-card structure, and speaking confidence under time pressure."
        ctaHref="/app/practice"
      />
    </>
  );
}
