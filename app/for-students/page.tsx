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
    description: "A structured daily speaking loop for students who want better scores — record, get AI feedback, read your transcript, and retry.",
    url: `${siteConfig.domain}/for-students`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function StudentsPage() {
  return (
    <AudiencePage
      audienceLabel="For students"
      heroTitle="Practice IELTS and TOEFL speaking with instant AI feedback"
      heroBody="SpeakAce gives you one structured loop: record your answer, get a band score, read the transcript, and retry with intention. Track everything in one student dashboard."
      heroKicker="Student practice loop"
      heroStats={[
        { value: "10 min", label: "Daily practice loop" },
        { value: "Instant", label: "AI score and transcript" },
        { value: "1 dashboard", label: "Progress, homework, classes" },
        { value: "Free start", label: "No card needed" },
      ]}
      heroSignals={[
        "IELTS Part 1, 2, and 3 — plus TOEFL speaking formats",
        "Instant AI score and full transcript after every attempt",
        "Dashboard tracks sessions, streaks, classes, and homework",
      ]}
      heroPreviewCards={[
        {
          label: "After your first attempt",
          body: "You get a band score, a full transcript, and the top 3 things to fix before you record again.",
        },
        {
          label: "After one week of practice",
          body: "Your dashboard shows your average score, streak, weakest skill, and the exact next step to improve it.",
        },
      ]}
      primaryAction={{ label: "Start free practice", href: "/app/practice" }}
      secondaryAction={{ label: "Try a free test", href: "/free-ielts-speaking-test", variant: "secondary" }}
      tertiaryAction={{ label: "Create account", href: "/auth?mode=signup", variant: "secondary" }}
      highlightsLabel="What students get"
      highlightsTitle="Everything you need to improve your speaking score in one place"
      highlights={[
        {
          title: "Practice like the real exam",
          body: "Work through IELTS Part 1, 2, and 3 or TOEFL task formats in the same account, with realistic prompts and timed attempts.",
          icon: Mic,
        },
        {
          title: "Review what actually happened",
          body: "Every attempt gives you a band score, a full transcript, and specific feedback — so you know exactly what to fix before you record again.",
          icon: BookOpenCheck,
        },
        {
          title: "See progress, not just isolated scores",
          body: "The student dashboard turns sessions, streaks, weak skills, class homework, and study lists into one visible system you can act on.",
          icon: BarChart3,
        },
        {
          title: "Retry with intention",
          body: "The platform encourages you to improve the same answer rather than jumping to random prompts. That structured repetition is what moves the score.",
          icon: Repeat2,
        },
        {
          title: "Speaking and writing in one workspace",
          body: "Keep your IELTS Writing Task 1 and 2 practice alongside your speaking sessions so the full exam feels more familiar.",
          icon: GraduationCap,
        },
        {
          title: "Join your teacher's class",
          body: "If your teacher uses SpeakAce, you can join their class with a code, see homework assignments, and get shared study lists directly in your dashboard.",
          icon: Sparkles,
        },
      ]}
      timelineLabel="Student journey"
      timelineTitle="From first attempt to visible progress in four steps"
      timeline={[
        {
          title: "Record your first speaking attempt",
          body: "Pick any IELTS or TOEFL prompt, record your answer, and get an AI band score with a full transcript within seconds.",
        },
        {
          title: "Read the feedback and understand why",
          body: "The result screen shows exactly which skill is holding you back — fluency, vocabulary, grammar, or pronunciation — with a concrete reason.",
        },
        {
          title: "Retry the same question with the feedback in mind",
          body: "Use the improved answer as a guide and record again. Most students improve 0.3 to 0.5 bands on the second attempt.",
        },
        {
          title: "Come back tomorrow and track your streak",
          body: "Your dashboard shows your streak, average score, and weekly focus so each session feels connected to the last.",
        },
      ]}
      testimonialsLabel="Student results"
      testimonialsTitle="What consistent daily practice looks like"
      testimonials={[
        {
          quote:
            "I finally understood what to do after each speaking attempt. The transcript and retry flow made my practice feel structured instead of random.",
          name: "Aizat M.",
          detail: "IELTS candidate, Band 7.0 achieved",
        },
        {
          quote:
            "The dashboard shows my homework, my class, and my next step without any confusion. I practice every morning before work and it only takes 10 minutes.",
          name: "Priya S.",
          detail: "Working professional, IELTS preparation",
        },
        {
          quote:
            "I went from Band 6 to Band 7.5 in six weeks. Reading my transcript every day showed me I was overusing the same phrases.",
          name: "Carlos R.",
          detail: "TOEFL candidate",
        },
      ]}
      leadLabel="Free IELTS checklist"
      leadTitle="Get the IELTS speaking checklist for week one"
      leadBody="Leave your email and we'll send you a free checklist covering the five things every serious IELTS candidate should practice in their first week."
      leadSource="students_checklist"
      finalCtaLabel="Start today"
      finalCtaTitle="Free to start — no credit card needed"
      finalCtaBody="Create your account in 2 minutes and complete your first scored speaking attempt today. Your progress, transcript history, and study plan are all saved automatically."
      finalPrimaryAction={{ label: "Start free practice", href: "/app/practice", variant: "primary" }}
      finalSecondaryAction={{ label: "See pricing", href: "/pricing", variant: "secondary" }}
    />
  );
}
