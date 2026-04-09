import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Speaking Test Simulator IELTS | SpeakAce",
  description:
    "Use a speaking test simulator for IELTS to practice with timing, transcript review, AI scoring support, and mock exam flow.",
  alternates: {
    canonical: "/speaking-test-simulator-ielts"
  },
  openGraph: {
    title: "Speaking Test Simulator IELTS | SpeakAce",
    description:
      "Practice with a speaking test simulator IELTS flow that feels closer to the real exam.",
    url: `${siteConfig.domain}/speaking-test-simulator-ielts`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function SpeakingTestSimulatorIeltsPage() {
  return (
    <>
      <MarketingPage
        eyebrow="Speaking test simulator IELTS"
        title="Use a speaking test simulator IELTS learners can train with before the real exam."
        description="Timed tasks, transcript review, estimated score support, and retry workflows make SpeakAce a stronger exam-practice environment."
        focus="This experience is built for students searching for a speaking test simulator IELTS product instead of generic speaking prompts or low-pressure chat apps."
        ctaHref="/app/practice"
      />
    </>
  );
}
