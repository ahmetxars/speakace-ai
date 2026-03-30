import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice AI | SpeakAce",
  description:
    "IELTS speaking practice with AI feedback, score estimates, transcripts, and timed speaking drills to improve fluency and confidence.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "IELTS Speaking Practice AI | SpeakAce",
    description:
      "Practice IELTS and TOEFL speaking online with AI feedback, score estimates, transcripts, and speaking test simulation.",
    url: siteConfig.domain,
    siteName: siteConfig.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Speaking Practice AI | SpeakAce",
    description:
      "Improve IELTS speaking score with AI feedback, transcript review, and speaking test simulator practice."
  },
  keywords: [
    "IELTS speaking practice",
    "IELTS speaking AI",
    "improve IELTS speaking score",
    "IELTS band score speaking",
    "AI English speaking practice",
    "speaking test simulator IELTS",
    "IELTS speaking feedback",
    "IELTS speaking mock test",
    "IELTS pronunciation practice",
    "TOEFL speaking practice"
  ]
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="AI coach for speaking"
        title="IELTS speaking practice with AI feedback, transcript review, and score-focused speaking drills."
        description="Improve your IELTS speaking score with AI English speaking practice, IELTS-style questions, speaking test simulation, and fast score-focused feedback."
        focus="SpeakAce targets high-intent search terms like IELTS speaking practice, IELTS speaking AI, improve IELTS speaking score, and speaking test simulator IELTS with a product built around real exam preparation."
        ctaHref="/app/practice"
      />
    </>
  );
}
