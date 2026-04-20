import type { Metadata } from "next";
import { BellRing, BookMarked, ChartNoAxesCombined, ClipboardList, GraduationCap, UsersRound } from "lucide-react";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Platform for Teachers | SpeakAce",
  description:
    "Manage your IELTS and TOEFL speaking classes from one panel. Assign homework, track every student's scores, share study lists, and send announcements.",
  alternates: { canonical: "/for-teachers" },
  openGraph: {
    title: "IELTS & TOEFL Platform for Teachers | SpeakAce",
    description: "Set up a class in 2 minutes, share a join code, and track every student's speaking progress in real time.",
    url: `${siteConfig.domain}/for-teachers`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function TeachersPage() {
  return (
    <AudiencePage
      audienceLabel="For teachers"
      heroTitle="Give your students a structured speaking system they will actually use"
      heroBody="SpeakAce puts your class in one panel: homework, scores, session history, announcements, and shared study lists — all connected without spreadsheets."
      heroKicker="Teacher workflow, simplified"
      heroStats={[
        { value: "2 min", label: "Class setup time" },
        { value: "1 join code", label: "Student onboarding" },
        { value: "Real-time", label: "Score visibility" },
        { value: "1 panel", label: "Homework and tracking" },
      ]}
      heroSignals={[
        "Create a class and share a join code in under 2 minutes",
        "See every student's scores, sessions, and weak skills in real time",
        "Assign homework and shared study lists from your teacher portal",
      ]}
      heroPreviewCards={[
        {
          label: "In your teacher portal",
          body: "You can see who practiced, what score they got, and which skill needs the most work — without asking them to fill a form.",
        },
        {
          label: "Between lessons",
          body: "Students complete homework assignments inside the app, and you see timestamps and scores before the next lesson starts.",
        },
      ]}
      primaryAction={{ label: "Open teacher portal", href: "/app/teacher" }}
      secondaryAction={{ label: "View demo class", href: "/teacher-demo", variant: "secondary" }}
      tertiaryAction={{ label: "Create account", href: "/auth?mode=signup", variant: "secondary" }}
      highlightsLabel="Teacher tools"
      highlightsTitle="Everything you need to run classes and track between-lesson practice"
      highlights={[
        {
          title: "See class performance at a glance",
          body: "Monitor scores, weak skills, attempt recency, and student risk signals from one panel — no spreadsheet required.",
          icon: ChartNoAxesCombined,
        },
        {
          title: "Assign targeted homework in seconds",
          body: "Pick any speaking prompt, set a due date, and assign it to your class. Students see it in their dashboard the moment you save it.",
          icon: ClipboardList,
        },
        {
          title: "Share prompts and study lists",
          body: "Push a curated set of practice prompts into every student's dashboard so they know exactly what to work on between lessons.",
          icon: BookMarked,
        },
        {
          title: "Keep students accountable between lessons",
          body: "Timestamps and completion data mean you can open the next lesson with real evidence of what each student practiced — and what they skipped.",
          icon: UsersRound,
        },
        {
          title: "Send class announcements in-platform",
          body: "Post a message to your entire class from the teacher portal. Students see it in their dashboard the next time they log in.",
          icon: BellRing,
        },
        {
          title: "Easy to recommend to colleagues",
          body: "A clear teacher portal and a simple student experience mean you can forward this to other teachers or heads of department without needing to explain everything.",
          icon: GraduationCap,
        },
      ]}
      timelineLabel="How teachers use it"
      timelineTitle="From first class to full workflow in four steps"
      timeline={[
        {
          title: "Create a class and share a join code",
          body: "The setup takes under 2 minutes. Students join with a 6-character code and appear in your roster automatically.",
        },
        {
          title: "Students start practicing between lessons",
          body: "They record speaking answers, get AI scores, and build a session history you can review before the next class.",
        },
        {
          title: "Assign homework and track completion",
          body: "Set a due date, pick a prompt, and every student in the class gets a homework card in their dashboard with timestamps and score tracking.",
        },
        {
          title: "Start the next lesson with real data",
          body: "Open the teacher portal and see who practiced, what score they achieved, and which students need the most support today.",
        },
      ]}
      testimonialsLabel="Teacher feedback"
      testimonialsTitle="How teachers describe the experience"
      testimonials={[
        {
          quote:
            "I can now send this to another teacher and they understand the class flow in five minutes. The portal explains itself.",
          name: "Sarah T.",
          detail: "IELTS preparation teacher",
        },
        {
          quote:
            "The homework feature alone is worth it. I know exactly who practiced before I walk into class, and the scores are already there.",
          name: "Marcus O.",
          detail: "Language school teacher",
        },
        {
          quote:
            "Having the student portal and the teacher portal as part of the same product makes the workflow make sense. It feels intentional.",
          name: "Nadia K.",
          detail: "TOEFL speaking coach",
        },
      ]}
      leadLabel="Teacher demo request"
      leadTitle="See how the teacher portal works for your classes"
      leadBody="Leave your email and we will send you a walkthrough of the teacher setup, homework flow, and student tracking panel."
      leadSource="teachers_demo"
      finalCtaLabel="Get started"
      finalCtaTitle="Set up your first class today — free to start"
      finalCtaBody="Create a teacher account, build your first class, and share the join code with your students. The full homework and tracking system is available from day one."
      finalPrimaryAction={{ label: "Open teacher tools", href: "/app/teacher", variant: "primary" }}
      finalSecondaryAction={{ label: "See plans", href: "/pricing", variant: "secondary" }}
    />
  );
}
