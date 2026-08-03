import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

const pagePath = "/ielts-speaking-ai";
const pageUrl = `${siteConfig.domain}${pagePath}`;
const pageTitle = "IELTS Speaking AI for Feedback and Retries";
const pageDescription =
  "Use IELTS speaking AI to turn recorded answers into transcripts, estimated criterion scores, clear feedback, improved examples, and focused retries.";

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
        alt: "SpeakAce IELTS speaking AI feedback"
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

export default function IeltsSpeakingAiPage() {
  return (
    <>
      <MarketingPage
        eyebrow="IELTS speaking AI"
        title="IELTS speaking AI that helps you sound clearer, more fluent, and more exam-ready."
        description="Get transcript review, score-focused feedback, speaking retries, and a better daily practice loop with SpeakAce."
        focus="AI transcript and retry"
        ctaHref="/app/practice"
      />
    </>
  );
}
