import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Improve IELTS Speaking Score | SpeakAce",
  description:
    "Improve IELTS speaking score with AI feedback, estimated band support, transcript review, and timed speaking drills.",
  alternates: {
    canonical: "/improve-ielts-speaking-score"
  },
  openGraph: {
    title: "Improve IELTS Speaking Score | SpeakAce",
    description:
      "Use SpeakAce to improve IELTS speaking score with daily speaking practice and faster answer review.",
    url: `${siteConfig.domain}/improve-ielts-speaking-score`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function ImproveIeltsSpeakingScorePage() {
  return (
    <>
      <MarketingPage
        eyebrow="Improve IELTS speaking score"
        title="Improve IELTS speaking score with faster retries, clearer feedback, and stronger answer structure."
        description="SpeakAce helps you practice under time pressure, inspect your transcript, and build speaking answers that feel more band-ready."
        focus="This page is for users actively searching how to improve IELTS speaking score with a product that combines AI feedback, band estimates, and practical daily repetition."
        ctaHref="/app/practice"
      />
    </>
  );
}
