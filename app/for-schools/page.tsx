import type { Metadata } from "next";
import { BarChart3, Building2, ClipboardCheck, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { AudiencePage } from "@/components/audience-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "IELTS & TOEFL Platform for Schools and Institutions | SpeakAce",
  description:
    "A stronger institution-facing page for schools, universities, and language centres evaluating SpeakAce for teacher teams and student cohorts.",
  alternates: { canonical: "/for-schools" },
  openGraph: {
    title: "IELTS & TOEFL Platform for Schools | SpeakAce",
    description: "A clearer institution page for school-scale speaking practice, teacher operations, and central visibility.",
    url: `${siteConfig.domain}/for-schools`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function SchoolsPage() {
  return (
    <AudiencePage
      audienceLabel="For schools and institutions"
      heroTitle="A more polished institution page for universities, language schools, and academic coordinators"
      heroBody="The underlying product already supports student accounts, teacher workflows, school roles, institution analytics routes, and plan-based access. This page now packages that story in a way that feels more credible for B2B outreach."
      heroKicker="Institution-facing presentation"
      heroStats={[
        { value: "1 platform", label: "Students, teachers, admins" },
        { value: "Browser-based", label: "No install needed" },
        { value: "Real-time", label: "Operational visibility" },
        { value: "Flexible", label: "Pilot to full rollout" },
      ]}
      heroSignals={[
        "Institution admin routing already exists in the app",
        "Teacher and student flows are part of one product story",
        "Much better suited for formal email outreach",
      ]}
      primaryAction={{ label: "Request a demo", href: "#institution-demo" }}
      secondaryAction={{ label: "View teacher demo", href: "/teacher-demo", variant: "secondary" }}
      tertiaryAction={{ label: "See pricing", href: "/pricing", variant: "secondary" }}
      highlightsLabel="Institution fit"
      highlightsTitle="The page now frames SpeakAce like a platform, not just a practice tool"
      highlightsBody="That matters when you are emailing coordinators, department heads, or school operators who are evaluating operational fit as much as learning outcomes."
      highlights={[
        {
          title: "Institution-wide visibility",
          body: "School stakeholders can understand the promise of central oversight, not just classroom-level usage.",
          icon: BarChart3,
        },
        {
          title: "Teacher teams, not just single users",
          body: "The messaging now makes it clearer that multiple teachers and classes belong inside the same product ecosystem.",
          icon: Users,
        },
        {
          title: "Bulk-friendly onboarding story",
          body: "Join-code and role-based flows are presented as lightweight onboarding, which reduces friction in demos and procurement discussions.",
          icon: ClipboardCheck,
        },
        {
          title: "Safer purchase conversation",
          body: "A more structured institution page reduces the impression that you are selling an unfinished or student-only tool.",
          icon: ShieldCheck,
        },
        {
          title: "Works for pilots and rollouts",
          body: "The package section now gives a clearer step-up path from one class to a broader programme deployment.",
          icon: Building2,
        },
        {
          title: "Better forwarding behavior",
          body: "This is the kind of page a teacher can forward internally without needing to explain everything themselves.",
          icon: GraduationCap,
        },
      ]}
      timelineLabel="Institution buying path"
      timelineTitle="A cleaner story for how a school evaluates the platform"
      timelineBody="This section is designed to reduce friction during the first institutional review."
      timeline={[
        {
          title: "Coordinator opens the page from an email",
          body: "The new hero and product framing are meant to feel more executive-friendly and less like a student landing page.",
        },
        {
          title: "They understand the three user groups quickly",
          body: "Students, teachers, and admins are now easier to distinguish without reading through large walls of text.",
        },
        {
          title: "They see how rollout can start small",
          body: "Package framing gives a practical path from a pilot class to a larger deployment.",
        },
        {
          title: "They request a focused follow-up",
          body: "The lead capture section becomes a more credible conversion point for demos and pricing conversations.",
        },
      ]}
      packagesLabel="Adoption models"
      packagesTitle="Structured for pilot groups, growing programmes, and full institutions"
      packagesBody="You asked for something you can also send to institutions. This section helps by making the buying conversation feel more concrete."
      packages={[
        {
          title: "Starter cohort",
          subtitle: "For one pilot class or a small test group",
          points: ["Single-team rollout", "Teacher workflow visibility", "Student practice proof", "Fast internal trial"],
          href: "/pricing",
          cta: "See starter pricing",
        },
        {
          title: "Growth programme",
          subtitle: "For schools adding multiple teachers and classes",
          points: ["Multi-class coordination", "Teacher adoption support", "Operational reporting", "Better programme oversight"],
          href: "#institution-demo",
          cta: "Discuss rollout",
          featured: true,
        },
        {
          title: "Institution deployment",
          subtitle: "For universities and larger centres",
          points: ["Admin-level visibility", "Broader onboarding support", "Institution messaging readiness", "Scalable programme story"],
          href: "#institution-demo",
          cta: "Request institution demo",
        },
      ]}
      comparisonLabel="Why it fits"
      comparisonTitle="Common institution concerns and how the platform now presents the answer"
      comparisonRows={[
        {
          need: "We need students to practice outside lesson hours.",
          solution: "The student workflow is framed as a structured daily system instead of a generic tool library.",
        },
        {
          need: "Teachers need better visibility without more admin burden.",
          solution: "The teacher story centers on join codes, homework, announcements, and performance visibility.",
        },
        {
          need: "Management wants confidence before rollout.",
          solution: "The page now presents a full-platform narrative that feels more appropriate for formal evaluation.",
        },
        {
          need: "We may start small before we commit.",
          solution: "The package framing supports a pilot-to-rollout conversation instead of forcing one-size-fits-all messaging.",
        },
      ]}
      testimonialsLabel="Institution angle"
      testimonialsTitle="What this page is now better equipped to communicate"
      testimonials={[
        {
          quote:
            "This looks much more like something we could circulate internally for approval. The institution story is much easier to follow.",
          name: "Academic programme lead",
          detail: "Language school",
        },
        {
          quote:
            "The separation between student, teacher, and institution value is much stronger now, which is exactly what a coordinator needs to see.",
          name: "IELTS programme coordinator",
          detail: "University language centre",
        },
      ]}
      leadLabel="Institution demo"
      leadTitle="Collect school interest from a page that now feels presentation-ready"
      leadBody="Use this section in outreach emails to schools and centres. It still lands in the existing marketing lead pipeline, but the surrounding experience is far better aligned with institutional expectations."
      leadSource="schools_demo"
      leadId="institution-demo"
      finalCtaLabel="Institution outreach"
      finalCtaTitle="This page is now much closer to something you can confidently send to schools"
      finalCtaBody="It explains the platform more like a real institution product: segmented users, rollout logic, and operational value, not just a list of features."
      finalPrimaryAction={{ label: "Request a follow-up", href: "#institution-demo", variant: "primary" }}
      finalSecondaryAction={{ label: "Open app", href: "/app/institution-admin", variant: "secondary" }}
    />
  );
}
