import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { CompareHub } from "@/components/compare-hub";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "SpeakAce vs Other Speaking Tools",
  description:
    "See the practical difference between SpeakAce and other speaking tools for IELTS and TOEFL preparation.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "SpeakAce vs Other Speaking Tools",
    description:
      "A simple comparison page showing how SpeakAce differs from generic speaking tools and apps.",
    url: `${siteConfig.domain}/compare`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function CompareHubPage() {
  return (
    <>
      <SiteHeader />
      <CompareHub />
    </>
  );
}
