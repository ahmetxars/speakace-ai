import type { Metadata } from "next";
import { CompareHub } from "@/components/compare-hub";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Best IELTS Speaking App Comparison | SpeakAce",
  description:
    "Compare SpeakAce with SmallTalk2Me, Speechful, official IELTS mock tests, and private tutoring. Find the best IELTS speaking app ->",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Best IELTS Speaking App Comparison | SpeakAce",
    description:
      "See how SpeakAce compares with other IELTS speaking options, from AI apps to private tutoring and official mock tests.",
    url: `${siteConfig.domain}/compare`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function CompareHubPage() {
  return (
    <>
      <CompareHub />
    </>
  );
}
