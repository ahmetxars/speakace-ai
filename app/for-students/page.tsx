import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Practice for Students | SpeakAce",
  description: "Practice IELTS and TOEFL speaking and writing with clear scoring, transcripts, focused feedback, and a simple retry loop.",
  alternates: { canonical: "/for-students" },
  openGraph: {
    title: "IELTS & TOEFL Practice for Students | SpeakAce",
    description: "Turn every IELTS and TOEFL attempt into a clear next step with SpeakAce.",
    url: `${siteConfig.domain}/for-students`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function StudentsPage() {
  return <AudiencePage audience="students" />;
}
