import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import PhraseBankClient from "./phrase-bank-client";

export const metadata: Metadata = {
  title: "IELTS Speaking Phrase Bank | 200+ Phrases | SpeakAce",
  description:
    "Browse 200+ IELTS speaking phrases organised by function — opinions, examples, contrast, time, and more. Filter, search, and copy phrases instantly.",
  alternates: { canonical: "/speaking-phrase-bank" },
  openGraph: {
    title: "IELTS Speaking Phrase Bank — 200+ Useful Phrases",
    description:
      "Filterable phrase bank with 200+ IELTS speaking expressions for opinions, examples, contrast, agreeing, disagreeing, and more.",
    url: `${siteConfig.domain}/speaking-phrase-bank`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function SpeakingPhraseBankPage() {
  return <PhraseBankClient />;
}
