import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI English Speaking Practice | SpeakAce",
  description:
    "Build a daily AI English speaking practice habit with transcript review, pronunciation feedback, and IELTS-style structure.",
  alternates: {
    canonical: "/ai-english-speaking-practice"
  },
  openGraph: {
    title: "AI English Speaking Practice | SpeakAce",
    description:
      "Practice English speaking every day with AI support, transcript review, and exam-style speaking drills.",
    url: `${siteConfig.domain}/ai-english-speaking-practice`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function AiEnglishSpeakingPracticePage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="AI English speaking practice"
        title="AI English speaking practice that feels structured enough to build real confidence."
        description="Use SpeakAce to speak more often, review what you said, and fix weak answers before they become habits."
        focus="SpeakAce is especially useful for learners who want AI English speaking practice but still care about exam structure, score growth, and daily consistency."
        ctaHref="/app/practice"
      />
    </>
  );
}
