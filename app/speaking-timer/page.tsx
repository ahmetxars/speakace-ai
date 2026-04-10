import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import SpeakingTimerClient from "./speaking-timer-client";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice Timer | Free Tool | SpeakAce",
  description:
    "Free IELTS speaking timer for Part 1, Part 2 prep + speaking, and Part 3. Practice with realistic time limits and built-in tips.",
  alternates: { canonical: "/speaking-timer" },
  openGraph: {
    title: "IELTS Speaking Practice Timer — Free Tool",
    description:
      "Time your IELTS speaking practice with dedicated Part 1, 2, and 3 timers. Includes two-phase Part 2 countdown and built-in strategy tips.",
    url: `${siteConfig.domain}/speaking-timer`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function SpeakingTimerPage() {
  return <SpeakingTimerClient />;
}
