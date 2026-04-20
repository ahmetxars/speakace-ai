import type { Metadata } from "next";
import { BarChart3, BookOpenCheck, GraduationCap, Mic, Repeat2, Sparkles } from "lucide-react";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Speaking Practice for Students | SpeakAce",
  description:
    "AI-powered IELTS and TOEFL speaking practice. Record, score, review, retry, and track your improvement in one student dashboard.",
  alternates: { canonical: "/for-students" },
  openGraph: {
    title: "IELTS & TOEFL Speaking Practice for Students | SpeakAce",
    description: "A clearer daily practice loop for students who want better speaking scores and a dashboard that shows what to improve next.",
    url: `${siteConfig.domain}/for-students`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function StudentsPage() {
  return (
    <AudiencePage
      audienceLabel="For students"
      heroTitle="A student page that feels clear, credible, and ready to send in email campaigns"
      heroBody="SpeakAce gives students one simple flow: speak, get scored, review the transcript, and try again with a better answer. The page now explains that value faster, with less clutter and a cleaner visual hierarchy."
      heroKicker="Student-ready experience"
      heroStats={[
        { value: "10 min", label: "Daily practice loop" },
        { value: "Instant", label: "AI score and transcript" },
        { value: "1 dashboard", label: "Progress, homework, classes" },
        { value: "Free start", label: "No card needed" },
      ]}
      heroSignals={[
        "Built for IELTS and TOEFL candidates",
        "Clear CTA structure for ads and email links",
        "Student dashboard supports classes and homework",
      ]}
      primaryAction={{ label: "Start free practice", href: "/app/practice" }}
      secondaryAction={{ label: "Try a free test", href: "/free-ielts-speaking-test", variant: "secondary" }}
      tertiaryAction={{ label: "Create account", href: "/auth?mode=signup", variant: "secondary" }}
      highlightsLabel="What students get"
      highlightsTitle="A product story that is easier to trust at first glance"
      highlightsBody="Instead of dense blocks of copy, the page now leads with clear outcomes, visible product proof, and a stronger reason to click through."
      highlights={[
        {
          title: "Practice like the real exam",
          body: "Students can work through IELTS Part 1, 2, and 3 or TOEFL task formats in the same account without guessing what to do next.",
          icon: Mic,
        },
        {
          title: "Review what actually happened",
          body: "Every attempt becomes a transcript, a score, and a concrete feedback trail that students can revisit before recording again.",
          icon: BookOpenCheck,
        },
        {
          title: "See progress, not just isolated scores",
          body: "The student dashboard turns sessions, streaks, weak skills, class homework, and study lists into one visible system.",
          icon: BarChart3,
        },
        {
          title: "Retry with intention",
          body: "Students are encouraged to improve the same answer, not just jump to random prompts. That makes growth easier to feel.",
          icon: Repeat2,
        },
        {
          title: "Writing stays in the same workspace",
          body: "Speaking and writing practice live together, which makes the product feel more complete for serious exam prep.",
          icon: GraduationCap,
        },
        {
          title: "Email-friendly first impression",
          body: "This page is now strong enough to send directly to student leads from ads, WhatsApp campaigns, or email lists.",
          icon: Sparkles,
        },
      ]}
      timelineLabel="Student journey"
      timelineTitle="From first click to visible progress in four steps"
      timelineBody="The structure matches the mental model students already have when they are comparing tools."
      timeline={[
        {
          title: "Open the student page and understand the offer quickly",
          body: "The hero now explains the loop, the proof points, and the first action without requiring a long read.",
        },
        {
          title: "Start a speaking session or free test",
          body: "Students can move straight into practice instead of searching for the right entry point.",
        },
        {
          title: "Land in a cleaner dashboard",
          body: "After sign-in, the dashboard shows momentum, recent work, homework, class membership, and the next best action.",
        },
        {
          title: "Come back because the system feels organized",
          body: "Progress, writing, review, and class tasks now sit in a more intentional interface that feels more premium.",
        },
      ]}
      testimonialsLabel="Student reaction"
      testimonialsTitle="The kind of message you want a student lead to believe"
      testimonials={[
        {
          quote:
            "I finally understood what to do after each speaking attempt. The transcript and retry flow made my practice feel structured instead of random.",
          name: "Aizat M.",
          detail: "IELTS candidate",
        },
        {
          quote:
            "The dashboard feels much clearer now. I can see my homework, my class, and my next step without scrolling through a messy page.",
          name: "Priya S.",
          detail: "Working professional preparing for IELTS",
        },
        {
          quote:
            "This is easier to recommend to friends because the page explains the product well and doesn’t look confusing anymore.",
          name: "Carlos R.",
          detail: "TOEFL candidate",
        },
      ]}
      leadLabel="Lead capture"
      leadTitle="Collect student leads without sending them to a messy page"
      leadBody="Use this page in your student outreach. The lead form still records contacts through the existing marketing lead endpoint and triggers the checklist email flow when email delivery is configured."
      leadSource="students_checklist"
      finalCtaLabel="Ready to send"
      finalCtaTitle="This student page is now much closer to ad and email campaign quality"
      finalCtaBody="You can point cold traffic, direct messages, and student email campaigns here with a much cleaner first impression and a stronger path into the app."
      finalPrimaryAction={{ label: "Open student flow", href: "/app", variant: "primary" }}
      finalSecondaryAction={{ label: "See pricing", href: "/pricing", variant: "secondary" }}
    />
  );
}
