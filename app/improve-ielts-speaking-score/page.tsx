import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { siteConfig } from "@/lib/site";

const pagePath = "/improve-ielts-speaking-score";
const pageUrl = `${siteConfig.domain}${pagePath}`;
const pageTitle = "Improve Your IELTS Speaking Score";
const pageDescription =
  "Improve your IELTS Speaking score by reviewing transcripts, targeting the four scoring criteria, and retrying answers with one focused change.";

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
        alt: "SpeakAce IELTS speaking score improvement"
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

export default function ImproveIeltsSpeakingScorePage() {
  return (
    <>
      <MarketingPage
        eyebrow="Improve IELTS speaking score"
        title="Improve IELTS speaking score with faster retries, clearer feedback, and stronger answer structure."
        description="SpeakAce helps you practice under time pressure, inspect your transcript, and build speaking answers that feel more band-ready."
        focus="Band improvement practice"
        ctaHref="/app/practice"
      />
    </>
  );
}
