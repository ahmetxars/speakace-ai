import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Platform for Teachers | SpeakAce",
  description: "Create classes, assign focused practice, and see IELTS and TOEFL learner progress between lessons without spreadsheets.",
  alternates: { canonical: "/for-teachers" },
  openGraph: {
    title: "IELTS & TOEFL Platform for Teachers | SpeakAce",
    description: "See who practiced, what needs attention, and what to teach next.",
    url: `${siteConfig.domain}/for-teachers`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function TeachersPage() {
  return <AudiencePage audience="teachers" />;
}
