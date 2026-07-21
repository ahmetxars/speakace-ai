import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Platform for Schools | SpeakAce",
  description: "Pilot structured IELTS and TOEFL practice with one cohort, then scale using connected student, teacher, and coordinator workflows.",
  alternates: { canonical: "/for-schools" },
  openGraph: {
    title: "IELTS & TOEFL Platform for Schools | SpeakAce",
    description: "A clear pilot path for students, teachers, and programme coordinators.",
    url: `${siteConfig.domain}/for-schools`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function SchoolsPage() {
  return <AudiencePage audience="schools" />;
}
