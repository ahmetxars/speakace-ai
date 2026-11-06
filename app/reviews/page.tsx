import { getServerLanguage } from "@/lib/language";
import { normalizePublicLanguage } from "@/lib/copy";
import { discoveryRefinementCopy } from "@/lib/discovery-refinement-copy";
import {
  PageHero,
  PageSection,
  PageCTA,
  PublicButton,
} from "@/components/public/page-primitives";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "SpeakAce Product Experience & Use Cases",
  description:
    "Review SpeakAce features for IELTS and TOEFL self-study, band improvement, and teacher workflows before choosing a plan.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "SpeakAce Product Experience & Use Cases",
    description:
      "Inspect SpeakAce workflows for self-study learners and teachers without anonymous testimonial claims.",
    url: `${siteConfig.domain}/reviews`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default async function ReviewsPage() {
  const t =
    discoveryRefinementCopy[normalizePublicLanguage(await getServerLanguage())];
  return (
    <main className="public-container">
      <PageHero
        eyebrow={t.reviewLabel}
        title={t.reviewTitle}
        description={t.reviewIntro}
        actions={
          <>
            <PublicButton href="/app/practice">
              {t.practiceAction}
            </PublicButton>
            <PublicButton href="/teacher-demo" secondary>
              {t.demoAction}
            </PublicButton>
          </>
        }
      />
      <PageSection
        eyebrow={t.reviewSection}
        title={t.reviewSectionTitle}
      >
        <div className="marketing-reading-features">
          {t.reviewGroups.map(([title, points], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <ul className="seo-bullet-list">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PageSection>
      <PageCTA
        title={t.reviewClosing}
        description={t.reviewClosingBody}
      >
        <PublicButton href="/app/practice">{t.practiceAction}</PublicButton>
        <PublicButton href="/pricing" secondary>
          {t.compareAction}
        </PublicButton>
      </PageCTA>
    </main>
  );
}
