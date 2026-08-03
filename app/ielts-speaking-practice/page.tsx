import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

const pagePath = "/ielts-speaking-practice";
const pageUrl = `${siteConfig.domain}${pagePath}`;
const pageTitle = "IELTS Speaking Practice Online (Parts 1–3)";
const pageDescription =
  "Practice IELTS Speaking Parts 1, 2, and 3 online with timed prompts, answer transcripts, criterion-level AI feedback, estimated bands, and focused retries.";

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
        alt: "SpeakAce IELTS speaking practice feedback"
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

export default function IELTSPage() {
  return (
    <>
      <MarketingPage
        eyebrow="IELTS speaking practice"
        title="IELTS speaking practice with AI feedback, timed cue cards, and transcript review."
        description="Train for IELTS Speaking Part 1, Part 2, and Part 3 online. Record answers, review transcripts, and improve fluency, coherence, and pronunciation."
        focus="Part 1, Part 2 and Part 3 practice"
        ctaHref="/app/practice"
      />
    </>
  );
}
