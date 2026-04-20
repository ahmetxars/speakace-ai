import type { Metadata } from "next";
import { BarChart3, Building2, ClipboardCheck, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Platform for Schools and Institutions | SpeakAce",
  description:
    "Deploy structured IELTS and TOEFL speaking practice across your school. One platform for students, teachers, and institution admins.",
  alternates: { canonical: "/for-schools" },
  openGraph: {
    title: "IELTS & TOEFL Platform for Schools | SpeakAce",
    description: "One platform for your students, teachers, and admin team. Start with a pilot class and expand when you're ready.",
    url: `${siteConfig.domain}/for-schools`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function SchoolsPage() {
  return (
    <AudiencePage
      audienceLabel="For schools and institutions"
      heroTitle="One platform for your students, teachers, and admin team"
      heroBody="SpeakAce supports every user group in one place: students track their progress, teachers manage classes and homework, and coordinators get visibility across all cohorts."
      heroKicker="Institution-ready platform"
      heroStats={[
        { value: "1 platform", label: "Students, teachers, admins" },
        { value: "Browser-based", label: "No install needed" },
        { value: "Real-time", label: "Operational visibility" },
        { value: "Flexible", label: "Pilot to full rollout" },
      ]}
      heroSignals={[
        "Start with one pilot class and scale when ready",
        "Admin panel with usage data across all teachers and students",
        "No software to install — fully browser-based for any device",
      ]}
      heroPreviewCards={[
        {
          label: "For coordinators",
          body: "See which classes are active, how many students practiced this week, and which teachers have the most engagement — all from one admin view.",
        },
        {
          label: "For procurement",
          body: "Browser-based, no install required, role-based access, and a pilot path that lets you test with one class before committing to a full rollout.",
        },
      ]}
      primaryAction={{ label: "Request a demo", href: "#institution-demo" }}
      secondaryAction={{ label: "View teacher demo", href: "/teacher-demo", variant: "secondary" }}
      tertiaryAction={{ label: "See pricing", href: "/pricing", variant: "secondary" }}
      highlightsLabel="Institution fit"
      highlightsTitle="Built for schools that need a platform, not just a practice tool"
      highlights={[
        {
          title: "Visibility across the whole institution",
          body: "Coordinators and department heads can see usage across all classes and teachers without needing to ask for individual reports.",
          icon: BarChart3,
        },
        {
          title: "Multiple teachers and classes in one account",
          body: "Each teacher manages their own classes independently, but the institution admin can see all of them from a single panel.",
          icon: Users,
        },
        {
          title: "Fast student onboarding with join codes",
          body: "No email provisioning or IT setup required. Students join a class with a 6-character code and are ready to practice within minutes.",
          icon: ClipboardCheck,
        },
        {
          title: "Reduces risk in procurement conversations",
          body: "A clearly structured platform with distinct student, teacher, and admin roles makes the evaluation process straightforward for procurement teams.",
          icon: ShieldCheck,
        },
        {
          title: "Start small and expand at your own pace",
          body: "Run a pilot with one class or one department. When it works, expand to the full school without changing platforms or data.",
          icon: Building2,
        },
        {
          title: "Easy for teachers to recommend internally",
          body: "When individual teachers see results, they forward the product to coordinators themselves. The platform is designed to make that conversation easy.",
          icon: GraduationCap,
        },
      ]}
      timelineLabel="Institution rollout path"
      timelineTitle="From first inquiry to active school deployment"
      timeline={[
        {
          title: "Request a demo or start a pilot class",
          body: "Talk to the team about your use case, or simply create a teacher account, set up one class, and test it yourself with a small group.",
        },
        {
          title: "Students and teachers onboard within minutes",
          body: "Teachers create classes and share join codes. Students open their dashboards in any browser and start practicing without IT involvement.",
        },
        {
          title: "Coordinators get visibility from day one",
          body: "The institution admin panel shows usage data, session counts, and class activity across all enrolled teachers and students.",
        },
        {
          title: "Scale when the pilot confirms results",
          body: "Expand from one class to the full school on the same platform. No migration, no new contracts, no new tools to learn.",
        },
      ]}
      packagesLabel="Adoption models"
      packagesTitle="Structured for pilot groups, growing programmes, and full institutions"
      packages={[
        {
          title: "Pilot class",
          subtitle: "For a small test group or one department",
          points: ["Single-class rollout", "Teacher portal access", "Student practice tracking", "No commitment required"],
          href: "/pricing",
          cta: "See starter pricing",
        },
        {
          title: "Growing programme",
          subtitle: "For schools adding multiple teachers and classes",
          points: ["Multi-class coordination", "Admin visibility panel", "Homework and announcement tools", "Operational reporting"],
          href: "#institution-demo",
          cta: "Discuss rollout",
          featured: true,
        },
        {
          title: "Full institution",
          subtitle: "For universities and language centres",
          points: ["School-wide deployment", "Coordinated onboarding support", "Institution analytics access", "Priority support channel"],
          href: "#institution-demo",
          cta: "Request institution demo",
        },
      ]}
      comparisonLabel="Common questions"
      comparisonTitle="What schools typically ask — and how the platform answers"
      comparisonRows={[
        {
          need: "Students need structured practice outside lesson hours.",
          solution: "The student dashboard gives a daily practice loop with homework, scores, and a streak tracker that keeps students coming back.",
        },
        {
          need: "Teachers need visibility without extra admin burden.",
          solution: "The teacher portal shows session history, scores, and weak skill data for every student automatically — no manual collection.",
        },
        {
          need: "Management needs confidence before committing to a full rollout.",
          solution: "Start with a free pilot class. The admin panel shows real usage data after day one, so the decision is based on evidence.",
        },
        {
          need: "The school may not be ready for full deployment right away.",
          solution: "The platform supports any scale. A single teacher with one class works just as well as a school with twenty teachers and two hundred students.",
        },
      ]}
      testimonialsLabel="Institution feedback"
      testimonialsTitle="What schools say after evaluating the platform"
      testimonials={[
        {
          quote:
            "This looks like something we could actually circulate internally for approval. The platform story is easy to follow and the admin visibility is exactly what we needed to see.",
          name: "Academic programme lead",
          detail: "Language school",
        },
        {
          quote:
            "The separation between student, teacher, and institution views is clear. That is what a coordinator needs to understand before taking it to the department head.",
          name: "IELTS programme coordinator",
          detail: "University language centre",
        },
      ]}
      leadLabel="Institution demo"
      leadTitle="Request a focused walkthrough for your school"
      leadBody="Leave your email and tell us about your programme. We will show you the admin panel, teacher workflow, and student dashboard in a single session."
      leadSource="schools_demo"
      leadId="institution-demo"
      finalCtaLabel="Get started"
      finalCtaTitle="Ready to run a pilot with your next class?"
      finalCtaBody="Start with one teacher, one class, and a join code. If it works, expand to the full school on the same platform."
      finalPrimaryAction={{ label: "Request a follow-up", href: "#institution-demo", variant: "primary" }}
      finalSecondaryAction={{ label: "Open app", href: "/app/institution-admin", variant: "secondary" }}
    />
  );
}
