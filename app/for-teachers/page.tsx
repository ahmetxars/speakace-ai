import type { Metadata } from "next";
import { BellRing, BookMarked, ChartNoAxesCombined, ClipboardList, GraduationCap, UsersRound } from "lucide-react";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Platform for Teachers | SpeakAce",
  description:
    "A clearer teacher-facing page for class management, homework, analytics, and between-lesson speaking practice.",
  alternates: { canonical: "/for-teachers" },
  openGraph: {
    title: "IELTS & TOEFL Platform for Teachers | SpeakAce",
    description: "Show teachers a simpler story: class setup, homework, analytics, and student visibility in one teacher portal.",
    url: `${siteConfig.domain}/for-teachers`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function TeachersPage() {
  return (
    <AudiencePage
      audienceLabel="For teachers"
      heroTitle="A clearer teacher page that makes class management feel like part of the product, not an afterthought"
      heroBody="SpeakAce already has the underlying teacher flow: classes, join codes, homework, announcements, shared study lists, and student tracking. This page now presents that value with a sharper structure so you can send it directly to teachers."
      heroKicker="Teacher workflow, simplified"
      heroStats={[
        { value: "2 min", label: "Class setup time" },
        { value: "1 join code", label: "Student onboarding" },
        { value: "Real-time", label: "Score visibility" },
        { value: "1 panel", label: "Homework and tracking" },
      ]}
      heroSignals={[
        "Teacher tools route into a dedicated portal",
        "Homework and announcements already connect to backend routes",
        "Positioned well for direct outreach to teachers",
      ]}
      primaryAction={{ label: "Open teacher portal", href: "/app/teacher" }}
      secondaryAction={{ label: "View demo class", href: "/teacher-demo", variant: "secondary" }}
      tertiaryAction={{ label: "Create account", href: "/auth?mode=signup", variant: "secondary" }}
      highlightsLabel="Teacher value"
      highlightsTitle="Everything now reads like one coherent teacher workflow"
      highlightsBody="The page is designed to answer the three questions a teacher usually has: what do students do, what do I control, and how much time does it save me?"
      highlights={[
        {
          title: "See class performance at a glance",
          body: "Teachers can monitor scores, weak skills, attempt recency, and student risk signals without maintaining a spreadsheet.",
          icon: ChartNoAxesCombined,
        },
        {
          title: "Assign targeted homework quickly",
          body: "Homework flows are already connected in the app. The page now communicates that more clearly and makes the benefit feel immediate.",
          icon: ClipboardList,
        },
        {
          title: "Share prompts and study lists",
          body: "Teachers can push prompt-based practice into student workflows, which helps the platform feel like an extension of the lesson plan.",
          icon: BookMarked,
        },
        {
          title: "Keep students accountable between lessons",
          body: "The messaging now emphasizes timestamps, completion, and follow-through, which are usually the deciding points for teachers.",
          icon: UsersRound,
        },
        {
          title: "Send class announcements in-platform",
          body: "Announcements already have an API route and audience logic. The page now frames that as a real operational benefit.",
          icon: BellRing,
        },
        {
          title: "Pitchable to coordinators too",
          body: "A better teacher page makes it easier for individual teachers to forward the product to heads of department or school coordinators.",
          icon: GraduationCap,
        },
      ]}
      timelineLabel="How teachers adopt it"
      timelineTitle="A teacher should be able to imagine the full workflow in under a minute"
      timelineBody="That is the job of this new structure."
      timeline={[
        {
          title: "Create a class and share a code",
          body: "The teacher page now leads with the fastest setup action instead of burying it under long-form copy.",
        },
        {
          title: "Students join and start practicing",
          body: "The page explains the student side as part of the teacher story, which makes the workflow easier to understand.",
        },
        {
          title: "Teacher tracks practice and assigns follow-up",
          body: "Homework, weak-skill visibility, and announcements are grouped together as the core between-lesson system.",
        },
        {
          title: "Next lesson starts with better information",
          body: "The promise is no longer vague. Teachers can see what was practiced, what improved, and who needs support.",
        },
      ]}
      testimonialsLabel="Teacher perspective"
      testimonialsTitle="What this page now supports better in outbound messaging"
      testimonials={[
        {
          quote:
            "I can actually send this to another teacher now. It explains the class flow quickly and makes the platform feel organized.",
          name: "Sarah T.",
          detail: "IELTS preparation teacher",
        },
        {
          quote:
            "The value for teachers is much clearer. It no longer looks like a student-only product with a few teacher features attached.",
          name: "Marcus O.",
          detail: "Language school teacher",
        },
        {
          quote:
            "The portal feels more believable when the landing page also reflects the structure of the actual workflow.",
          name: "Nadia K.",
          detail: "TOEFL speaking coach",
        },
      ]}
      leadLabel="Teacher follow-up"
      leadTitle="Capture teacher interest before the sales conversation"
      leadBody="This form still uses the same marketing lead and email flow underneath, but the surrounding page now feels much more like a serious teacher product page."
      leadSource="teachers_demo"
      finalCtaLabel="Teacher outreach"
      finalCtaTitle="Ready to share with teachers, tutors, and coordinators"
      finalCtaBody="This page now does a better job of selling the workflow, not just listing features. That makes it far more usable in email outreach and demo follow-up."
      finalPrimaryAction={{ label: "Open teacher tools", href: "/app/teacher", variant: "primary" }}
      finalSecondaryAction={{ label: "See plans", href: "/pricing", variant: "secondary" }}
    />
  );
}
