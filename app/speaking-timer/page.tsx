import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import SpeakingTimerClient from "./speaking-timer-client";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Speaking Timer | Free Tool | SpeakAce",
  description:
    "Free IELTS and TOEFL speaking timer with realistic prep and speaking phases, built-in tips, and quick practice presets.",
  alternates: { canonical: "/speaking-timer" },
  openGraph: {
    title: "IELTS & TOEFL Speaking Timer — Free Tool",
    description:
      "Time your IELTS and TOEFL speaking practice with dedicated presets, prep phases, and built-in strategy tips.",
    url: `${siteConfig.domain}/speaking-timer`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function SpeakingTimerPage() {
  return <SpeakingTimerClient />;
}
