"use client";
import type { Route } from "next";
import dynamic from "next/dynamic";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage } from "@/lib/copy";
import { content } from "@/lib/audience-copy";
import { publicDesignCopy } from "@/lib/public-design-copy";
import { marketingPageCopy } from "@/lib/marketing-page-copy";
import {
  PageHero,
  PageSection,
  PageCTA,
  PublicButton,
} from "@/components/public/page-primitives";
import { AudienceScene } from "@/components/public/audience-scene";
import { buildFaqJsonLd, jsonLdToHtml } from "@/lib/structured-data";
const MiniSpeakingDemo = dynamic(
  () =>
    import("@/components/mini-speaking-demo").then((m) => m.MiniSpeakingDemo),
  { ssr: false },
);
type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
  ctaHref: Route | string;
  variant?: "default" | "minimal";
};
export function MarketingPage({
  eyebrow,
  title,
  description,
  focus,
  ctaHref,
}: MarketingPageProps) {
  const { language } = useAppState();
  const locale = normalizePublicLanguage(language);
  const t = marketingPageCopy[locale === "tr" ? "tr" : "en"];
  const a = content[locale].students;
  const c = publicDesignCopy[locale];
  return (
    <main className="public-container public-marketing-page">
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            <PublicButton href={ctaHref}>{c.start}</PublicButton>
            <PublicButton href="#practice-example" secondary>
              {c.freeTest}
            </PublicButton>
          </>
        }
        visual={<AudienceScene audience="students" locale={locale} />}
      />
      <div className="public-focus-note">
        <span>{eyebrow}</span>
        <p>{focus}</p>
      </div>
      <PageSection
        eyebrow={a.outcomesEyebrow}
        title={a.outcomesTitle}
        description={a.outcomesBody}
      >
        <div className="marketing-reading-features">
          {a.outcomes.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow={a.workflowEyebrow} title={a.workflowTitle}>
        <ol className="pricing-checkout-steps">
          {a.workflow.map((item, index) => (
            <li key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </PageSection>
      <section className="public-section" id="practice-example">
        <span className="public-kicker">{c.freeTest}</span>
        <MiniSpeakingDemo language={language === "tr" ? "tr" : "en"} />
      </section>
      <PageSection eyebrow={t.faqEyebrow} title={t.faqTitle}>
        <div className="public-faq-list">
          {t.faqs.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </PageSection>
      <PageCTA
        eyebrow={a.closingEyebrow}
        title={a.closingTitle}
        description={a.closingBody}
      >
        <PublicButton href={ctaHref}>{c.start}</PublicButton>
        <PublicButton href="/pricing" secondary>
          {c.plans}
        </PublicButton>
      </PageCTA>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToHtml(
            buildFaqJsonLd(
              t.faqs.map((item) => ({ question: item.q, answer: item.a })),
            ),
          ),
        }}
      />
    </main>
  );
}
