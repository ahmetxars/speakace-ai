"use client";

import Link from "next/link";

import { Check, GraduationCap, Mail, School, UsersRound } from "lucide-react";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { useAppState } from "@/components/providers";
import { siteConfig } from "@/lib/site";
import { publicDesignCopy } from "@/lib/public-design-copy";
import { normalizePublicLanguage } from "@/lib/copy";
import {
  content,
  programNavigation,
  type ProgramAudience,
} from "@/lib/audience-copy";
import {
  PageCTA,
  PageHero,
  PublicButton,
} from "@/components/public/page-primitives";
import {
  LearnerPreview,
  StudentWorkflow,
  TeacherWorkflow,
  SchoolWorkflow,
} from "@/components/public/audience-workflows";
import "@/app/public-audience.css";
import { audienceRefinementCopy } from "@/lib/audience-refinement-copy";
import { AudienceScene } from "@/components/public/audience-scene";

export type { ProgramAudience } from "@/lib/audience-copy";

const routes = {
  students: {
    primary: "/auth?mode=signup&cta=students_program",
    secondary: "/pricing",
    leadSource: "students_checklist",
  },
  teachers: {
    primary: "/auth?mode=signup&cta=teachers_program",
    secondary: "/teacher-demo",
    leadSource: "teachers_demo",
  },
  schools: {
    primary: "#program-contact",
    secondary: "/teacher-demo",
    leadSource: "schools_demo",
  },
} as const;
const paths = [
  { key: "students", href: "/for-students", icon: GraduationCap },
  { key: "teachers", href: "/for-teachers", icon: UsersRound },
  { key: "schools", href: "/for-schools", icon: School },
] as const;

export function AudiencePage({ audience }: { audience: ProgramAudience }) {
  const { language, commercialEmailEnabled } = useAppState();
  const locale = normalizePublicLanguage(language);
  const copy = content[locale][audience];
  const t = publicDesignCopy[locale];
  const navigation = programNavigation[locale];
  const route = routes[audience];
  const school = audienceRefinementCopy[locale].school;
  return (
    <main className="public-container audience-page" data-audience={audience}>
      <nav className="audience-paths" aria-label={navigation.label}>
        <span>{navigation.label}</span>
        <div>
          {paths.map(({ key, href, icon: Icon }) => (
            <Link
              href={href}
              key={key}
              aria-current={audience === key ? "page" : undefined}
            >
              <Icon size={15} />
              {navigation[key]}
            </Link>
          ))}
        </div>
      </nav>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.body}
        visual={
          audience === "students" ? (
            <LearnerPreview locale={locale} />
          ) : audience === "teachers" ? (
            <AudienceScene audience="teachers" locale={locale} />
          ) : undefined
        }
        actions={
          <>
            <PublicButton href={route.primary}>
              {audience === "schools" ? school.contact : copy.primary}
            </PublicButton>
            <PublicButton href={route.secondary} secondary>
              {audience === "schools" ? school.demo : copy.secondary}
            </PublicButton>
          </>
        }
      >
        <ul className="audience-signals">
          {copy.signals.map((signal) => (
            <li key={signal}>
              <Check size={13} />
              {signal}
            </li>
          ))}
        </ul>
      </PageHero>
      {audience === "students" ? (
        <StudentWorkflow locale={locale} />
      ) : audience === "teachers" ? (
        <TeacherWorkflow locale={locale} />
      ) : (
        <SchoolWorkflow locale={locale} />
      )}
      <section id="program-contact" className="audience-contact public-section">
        <div>
          <span className="public-kicker">
            {commercialEmailEnabled ? copy.leadEyebrow : t.contact}
          </span>
          <h2>
            {audience === "schools"
              ? school.contactTitle
              : commercialEmailEnabled
                ? copy.leadTitle
                : t.contactTitle}
          </h2>
          <p>
            {audience === "schools"
              ? school.contactBody
              : commercialEmailEnabled
                ? copy.leadBody
                : t.contactBody}
          </p>
        </div>
        <div
          className={
            "audience-lead" + (!commercialEmailEnabled ? " is-contact" : "")
          }
        >
          {commercialEmailEnabled ? (
            <LeadCaptureForm source={route.leadSource} />
          ) : (
            <>
              <Mail size={28} strokeWidth={1.3} />
              <a href={`mailto:${siteConfig.contactEmail}`}>
                {siteConfig.contactEmail}
              </a>
              <Link href="/contact">{t.contact} ↗</Link>
            </>
          )}
        </div>
      </section>
      <PageCTA
        eyebrow={copy.closingEyebrow}
        title={copy.closingTitle}
        description={copy.closingBody}
      >
        <PublicButton
          href={
            audience === "schools"
              ? `mailto:${siteConfig.contactEmail}?subject=SpeakAce%20school%20pilot`
              : route.primary
          }
        >
          {audience === "schools" ? school.contact : copy.closingPrimary}
        </PublicButton>
        <PublicButton href={route.secondary} secondary>
          {copy.closingSecondary}
        </PublicButton>
      </PageCTA>
    </main>
  );
}
