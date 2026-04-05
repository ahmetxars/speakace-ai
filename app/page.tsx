import type { Metadata } from "next";
import { MarketingSchema } from "@/components/marketing-schema";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice Online with AI | Improve Your Score",
  description:
    "Increase your IELTS Speaking score with AI practice. Practice real questions, get instant feedback, and improve your fluency fast.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "IELTS Speaking Practice Online with AI | Improve Your Score",
    description:
      "Practice real IELTS speaking questions, get instant feedback, and improve your fluency with AI-powered score support.",
    url: siteConfig.domain,
    siteName: siteConfig.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Speaking Practice Online with AI | Improve Your Score",
    description:
      "Increase your IELTS Speaking score with AI practice, instant feedback, and a faster retry loop."
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
      <MarketingSchema />
      <SiteHeader />
      <MarketingPage
        eyebrow="IELTS speaking score improvement"
        title="Increase your IELTS Speaking score with AI practice"
        description="Practice real questions, get instant feedback, and improve your fluency fast."
        focus="SpeakAce helps learners practice online, see IELTS-style band signals, and turn every answer into a clearer next attempt."
        ctaHref="/app/practice"
        variant="minimal"
      />
    </>
  );
}
