import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI IELTS & TOEFL Speaking Practice",
  description:
    "Practice IELTS and TOEFL speaking online with AI feedback, score estimates, transcripts, and timed speaking exercises.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SpeakAce AI | IELTS & TOEFL Speaking Practice",
    description: siteConfig.description,
    url: siteConfig.domain,
    siteName: siteConfig.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakAce AI",
    description: siteConfig.description
  },
  keywords: [
    "IELTS speaking practice",
    "TOEFL speaking practice",
    "AI speaking coach",
    "IELTS speaking AI",
    "TOEFL speaking AI",
    "speaking exam practice"
  ]
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="AI coach for speaking"
        title="Practice IELTS and TOEFL speaking with a cleaner, faster AI coach."
        description="Record exam-style answers, review transcripts, get score estimates, and train with focused speaking feedback built for language learners."
        focus="It is positioned around speaking preparation, timed drills, and score-oriented feedback so the site can rank for relevant exam-intent searches instead of generic AI chat terms."
        ctaHref="/app/practice"
      />
    </>
  );
}
