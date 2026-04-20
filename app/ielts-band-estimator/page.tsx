import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import BandEstimatorClient from "./band-estimator-client";

export const metadata: Metadata = {
  title: "IELTS Speaking Calculator | Free Band Estimator | SpeakAce",
  description:
    "Use our free IELTS speaking calculator and 6-question band estimator to understand your current level and what to improve next.",
  alternates: { canonical: "/ielts-band-estimator" },
  openGraph: {
    title: "IELTS Speaking Calculator — Free Band Estimator",
    description:
      "Answer 6 quick questions and estimate your IELTS speaking band score with targeted next-step tips.",
    url: `${siteConfig.domain}/ielts-band-estimator`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function IeltsBandEstimatorPage() {
  return <BandEstimatorClient />;
}
