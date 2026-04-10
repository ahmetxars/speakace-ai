import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import BandEstimatorClient from "./band-estimator-client";

export const metadata: Metadata = {
  title: "IELTS Band Score Estimator | Free Quiz | SpeakAce",
  description:
    "Take our free 6-question quiz to estimate your IELTS speaking band score. Get personalised tips to improve fast.",
  alternates: { canonical: "/ielts-band-estimator" },
  openGraph: {
    title: "IELTS Band Score Estimator — Free Quiz",
    description:
      "Answer 6 quick questions and find out your estimated IELTS speaking band score with targeted improvement tips.",
    url: `${siteConfig.domain}/ielts-band-estimator`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function IeltsBandEstimatorPage() {
  return <BandEstimatorClient />;
}
