import type { Metadata } from "next";
import { TeacherDemoPage as TeacherDemoExperience } from "@/components/teacher-demo-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Teacher Demo Class",
  description:
    "See how a teacher demo class can look inside SpeakAce with homework, risk alerts, student summaries, and speaking progress.",
  alternates: { canonical: "/teacher-demo" },
  openGraph: {
    title: "Teacher Demo Class | SpeakAce",
    description:
      "A demo teacher class view for IELTS and TOEFL speaking workflows, student tracking, and homework follow-up.",
    url: `${siteConfig.domain}/teacher-demo`,
    siteName: siteConfig.name,
    type: "website"
  }
};

export default function TeacherDemoPage() {
  return <TeacherDemoExperience />;
}
