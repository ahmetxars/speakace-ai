import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking AI | SpeakAce",
  description:
    "Use IELTS speaking AI to get transcript review, band score estimates, and faster speaking feedback with SpeakAce.",
  alternates: {
    canonical: "/ielts-speaking-ai"
  },
  openGraph: {
    title: "IELTS Speaking AI | SpeakAce",
    description:
      "Practice with IELTS speaking AI, smarter transcript review, and score-focused speaking feedback.",
    url: `${siteConfig.domain}/ielts-speaking-ai`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function IeltsSpeakingAiPage() {
  return (
    <>
      <SiteHeader />
      <MarketingPage
        eyebrow="IELTS speaking AI"
        title="IELTS speaking AI that helps you sound clearer, more fluent, and more exam-ready."
        description="Get transcript review, score-focused feedback, speaking retries, and a better daily practice loop with SpeakAce."
        focus="SpeakAce is built for learners who specifically want IELTS speaking AI support instead of generic chat or broad English practice apps."
        ctaHref="/app/practice"
      />
    </>
  );
}
