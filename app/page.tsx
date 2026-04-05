import type { Metadata } from "next";
import { MarketingSchema } from "@/components/marketing-schema";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice Online with AI | SpeakAce",
  description:
    "Practice IELTS speaking with AI, get instant feedback, and improve your fluency faster.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "IELTS Speaking Practice Online with AI | SpeakAce",
    description:
      "Practice IELTS speaking with AI, get instant feedback, and improve your fluency faster.",
    url: siteConfig.domain,
    siteName: siteConfig.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Speaking Practice Online with AI | SpeakAce",
    description:
      "Practice IELTS speaking with AI, get instant feedback, and improve your fluency faster."
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
        title="IELTS Speaking Practice with AI"
        description="Practice real questions, get instant feedback, and improve your English speaking fluency faster."
        focus="SpeakAce helps learners practice online, see IELTS-style band signals, and turn every answer into a clearer next attempt."
        ctaHref="/app/practice"
        variant="minimal"
      />
    </>
  );
}
