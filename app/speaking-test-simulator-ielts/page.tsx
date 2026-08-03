import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

const pagePath = "/speaking-test-simulator-ielts";
const pageUrl = `${siteConfig.domain}${pagePath}`;
const pageTitle = "IELTS Speaking Test Simulator & Mock Practice";
const pageDescription =
  "Run a timed IELTS speaking test simulator with Part 1, Part 2, and Part 3 tasks, transcript review, estimated scores, and a structured mock-exam flow.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pageUrl
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    title: `${pageTitle} | ${siteConfig.name}`,
    description: pageDescription,
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: `${siteConfig.domain}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SpeakAce IELTS speaking test simulator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${siteConfig.name}`,
    description: pageDescription,
    images: [`${siteConfig.domain}/og-image.png`]
  }
};

export default function SpeakingTestSimulatorIeltsPage() {
  return (
    <>
      <MarketingPage
        eyebrow="Speaking test simulator IELTS"
        title="Use a speaking test simulator IELTS learners can train with before the real exam."
        description="Timed tasks, transcript review, estimated score support, and retry workflows make SpeakAce a stronger exam-practice environment."
        focus="Timed mock speaking flow"
        ctaHref="/app/practice"
      />
    </>
  );
}
