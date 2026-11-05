"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  Check,
  FileText,
  GraduationCap,
  Mail,
  MessageSquareText,
  MoveRight,
  School,
  UsersRound,
} from "lucide-react";
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
  PageSection,
  PublicButton,
} from "@/components/public/page-primitives";
import { AudienceScene } from "@/components/public/audience-scene";
import { handleTabKeys } from "@/lib/tab-navigation";
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
  const [stage, setStage] = useState(0);
  const id = useId();
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
        visual={<AudienceScene audience={audience} locale={locale} />}
        actions={
          <>
            <PublicButton href={route.primary}>{copy.primary}</PublicButton>
            <PublicButton href={route.secondary} secondary>
              {copy.secondary}
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
      <PageSection
        eyebrow={copy.outcomesEyebrow}
        title={copy.outcomesTitle}
        description={copy.outcomesBody}
      >
        <div className="audience-feature-explorer">
          <div
            role="tablist"
            aria-label={copy.outcomesEyebrow}
            onKeyDown={handleTabKeys}
            className="audience-feature-tabs"
          >
            {copy.outcomes.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-controls={`${id}-panel`}
                aria-selected={stage === index}
                tabIndex={stage === index ? 0 : -1}
                onClick={() => setStage(index)}
              >
                <span>0{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
                <MoveRight size={18} />
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${stage}`}
            tabIndex={0}
          >
            <AudienceScene
              audience={audience}
              locale={locale}
              stage={stage}
              compact
            />
          </div>
        </div>
      </PageSection>
      <PageSection eyebrow={copy.workflowEyebrow} title={copy.workflowTitle}>
        <ol className="audience-workflow">
          {copy.workflow.map((step, index) => {
            const Icon = [
              audience === "students" ? MessageSquareText : UsersRound,
              FileText,
              Check,
            ][index];
            return (
              <li key={step.title}>
                <div className="audience-step-visual">
                  <span>0{index + 1}</span>
                  <Icon size={32} strokeWidth={1.25} />
                  <i />
                  <i />
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            );
          })}
        </ol>
      </PageSection>
      <section id="program-contact" className="audience-contact public-section">
        <div>
          <span className="public-kicker">
            {commercialEmailEnabled ? copy.leadEyebrow : t.contact}
          </span>
          <h2>{commercialEmailEnabled ? copy.leadTitle : t.contactTitle}</h2>
          <p>{commercialEmailEnabled ? copy.leadBody : t.contactBody}</p>
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
              ? "mailto:aa.arslan@outlook.com.tr?subject=SpeakAce%20school%20pilot"
              : route.primary
          }
        >
          {copy.closingPrimary}
        </PublicButton>
        <PublicButton href={route.secondary} secondary>
          {copy.closingSecondary}
        </PublicButton>
      </PageCTA>
    </main>
  );
}
