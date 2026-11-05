"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Download, MessageSquareText } from "lucide-react";
import { useAppState } from "@/components/providers";
import { usePanelFeedback } from "@/components/motion/use-panel-feedback";
import { TrackedLink } from "@/components/tracked-link";
import { trackClientEvent } from "@/lib/analytics-client";
import { normalizePublicLanguage } from "@/lib/copy";
import { buildPlanCheckoutPath, commerceConfig } from "@/lib/commerce";
import { PLAN_LIMITS } from "@/lib/membership";
import { pricingCopy } from "@/lib/pricing-copy";
import {
  PageCTA,
  PageHero,
  PageSection,
  PublicButton,
} from "@/components/public/page-primitives";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function PricingCards() {
  const { currentUser, signedIn, language } = useAppState();
  const t = pricingCopy[normalizePublicLanguage(language)];
  const [billing, setBilling] = useState<"weekly" | "annual">("weekly");
  const [demoPlan, setDemoPlan] = useState<"free" | "plus">("free");
  const feedback = usePanelFeedback(billing);
  const demoFeedback = usePanelFeedback(demoPlan);
  const paid = signedIn && currentUser?.plan && currentUser.plan !== "free";
  const annual = billing === "annual";
  useEffect(() => {
    void trackClientEvent({
      userId: currentUser?.id,
      event: "pricing_view",
      path: "/pricing",
    });
  }, [currentUser?.id]);
  const rows = [
    {
      label: t.sessions,
      free: PLAN_LIMITS.free.sessionsPerDay,
      plus: PLAN_LIMITS.plus.sessionsPerDay,
    },
    {
      label: t.minutes,
      free: PLAN_LIMITS.free.speakingMinutesPerDay,
      plus: PLAN_LIMITS.plus.speakingMinutesPerDay,
    },
    { label: t.feedback, free: t.included, plus: t.included },
    { label: t.writing, free: t.included, plus: t.included },
    { label: t.export, free: t.unavailable, plus: t.included },
  ];
  return (
    <main className="public-container pricing-page">
      <PageHero eyebrow={t.eyebrow} title={t.title} description={t.intro} />
      <section
        className="pricing-offers"
        {...feedback.input}
        aria-label={t.offer}
      >
        <div className="public-segmented" role="group" aria-label={t.offer}>
          <button
            type="button"
            aria-pressed={!annual}
            onClick={() => setBilling("weekly")}
          >
            {t.weekly}
          </button>
          <button
            type="button"
            aria-pressed={annual}
            onClick={() => setBilling("annual")}
          >
            {t.annual}
          </button>
        </div>
        <div className="pricing-offer-grid">
          <article className="pricing-offer">
            <div className="pricing-offer-top">
              <span>01</span>
              <span>{t.forever}</span>
            </div>
            <h2>{t.free}</h2>
            <div className="pricing-amount">$0</div>
            <p>{t.freeNote}</p>
            <ul>
              <li>
                <Check size={15} />
                {PLAN_LIMITS.free.sessionsPerDay} · {t.sessions}
              </li>
              <li>
                <Check size={15} />
                {PLAN_LIMITS.free.speakingMinutesPerDay} · {t.minutes}
              </li>
              <li>
                <Check size={15} />
                {t.feedback}
              </li>
              <li>
                <Check size={15} />
                {t.writing}
              </li>
            </ul>
            <PublicButton
              href={
                signedIn
                  ? "/app/practice"
                  : "/auth?mode=signup&cta=pricing_free"
              }
              secondary
            >
              {t.freeCta}
            </PublicButton>
          </article>
          <article className="pricing-offer is-plus">
            <div className="pricing-offer-top">
              <span>02</span>
              <span>{annual ? t.once : t.weekly}</span>
            </div>
            <h2>SpeakAce Plus</h2>
            <div className="pricing-amount" ref={feedback.ref}>
              {annual
                ? commerceConfig.plusAnnualPrice
                : commerceConfig.plusMonthlyPrice}
              <small>{annual ? t.once : t.week}</small>
            </div>
            <p>{t.plusNote}</p>
            <ul>
              <li>
                <Check size={15} />
                {PLAN_LIMITS.plus.sessionsPerDay} · {t.sessions}
              </li>
              <li>
                <Check size={15} />
                {PLAN_LIMITS.plus.speakingMinutesPerDay} · {t.minutes}
              </li>
              <li>
                <Check size={15} />
                {t.feedback} + {t.writing}
              </li>
              <li>
                <Check size={15} />
                {t.export}
              </li>
            </ul>
            <TrackedLink
              className="public-button"
              href={
                paid
                  ? "/app/billing"
                  : buildPlanCheckoutPath({
                      plan: "plus",
                      billing,
                      campaign: "pricing_primary",
                    })
              }
              userId={currentUser?.id}
              analyticsEvent={
                paid ? "pricing_plus_click" : "checkout_initiated"
              }
              analyticsPath={
                paid ? "/pricing/manage-plan" : `/pricing/plus/${billing}`
              }
              onClick={() => {
                if (paid) return;
                void trackClientEvent({
                  userId: currentUser?.id,
                  event: "pricing_plus_click",
                  path: `/pricing/plus/${billing}`,
                  source: "pricing_primary",
                  plan: "plus",
                });
              }}
            >
              {paid ? t.manage : t.plusCta}
              <ArrowUpRight size={18} />
            </TrackedLink>
            <p className="pricing-terms">{annual ? t.annualTerms : t.trial}</p>
          </article>
        </div>
        <p className="pricing-account-note">{paid ? t.paid : t.account}</p>
      </section>
      <PageSection eyebrow={t.comparison} title={t.comparisonTitle}>
        <div
          className="pricing-comparison"
          role="region"
          aria-label={t.comparison}
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">{t.comparison}</th>
                <th scope="col">Free</th>
                <th scope="col">Plus</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.free}</td>
                  <td>{row.plus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pricing-footnote">{t.quotaNote}</p>
      </PageSection>
      <PageSection
        eyebrow={t.demoEyebrow}
        title={t.demoTitle}
        description={t.demoBody}
      >
        <div className="pricing-demo" {...demoFeedback.input}>
          <div className="pricing-demo-notebook">
            <span className="public-kicker">IELTS · Speaking Part 1</span>
            <h3>{t.samplePrompt}</h3>
            <blockquote>{t.sampleAnswer}</blockquote>
            <div className="audience-note">
              <MessageSquareText size={20} />
              <strong>{t.sampleFeedback}</strong>
            </div>
            <small>{t.sample}</small>
          </div>
          <div className="pricing-demo-controls">
            <div
              className="public-segmented"
              role="group"
              aria-label={t.demoEyebrow}
            >
              <button
                aria-pressed={demoPlan === "free"}
                type="button"
                onClick={() => setDemoPlan("free")}
              >
                Free
              </button>
              <button
                aria-pressed={demoPlan === "plus"}
                type="button"
                onClick={() => setDemoPlan("plus")}
              >
                Plus
              </button>
            </div>
            <div ref={demoFeedback.ref} className="pricing-demo-allowance">
              <div>
                <strong>{PLAN_LIMITS[demoPlan].sessionsPerDay}</strong>
                <span>{t.sessions}</span>
              </div>
              <div>
                <strong>{PLAN_LIMITS[demoPlan].speakingMinutesPerDay}</strong>
                <span>{t.minutes}</span>
              </div>
              <div
                className={
                  "pricing-demo-export " +
                  (demoPlan === "plus" ? "is-included" : "")
                }
              >
                <Download size={20} />
                <span>
                  {t.report}
                  <small>
                    {demoPlan === "plus" ? t.included : t.unavailable}
                  </small>
                </span>
                {demoPlan === "plus" && <Check size={17} />}
              </div>
              <p>{t.reportNote}</p>
            </div>
          </div>
        </div>
      </PageSection>
      <PageSection eyebrow={t.checkoutEyebrow} title={t.checkoutTitle}>
        <ol className="pricing-checkout-steps">
          {t.checkoutSteps.map((step, index) => (
            <li key={step.title}>
              <span>0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </PageSection>
      <PageSection title={t.faqTitle}>
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
        <a className="public-text-link" href={commerceConfig.customerPortalUrl}>
          {t.portal} ↗
        </a>
      </PageSection>
      <section className="pricing-school public-section" id="schools">
        <span className="public-kicker">{t.schools}</span>
        <div>
          <h2>{t.schoolTitle}</h2>
          <p>{t.schoolBody}</p>
          <PublicButton href="/for-schools" secondary>
            {t.schoolCta}
          </PublicButton>
        </div>
      </section>
      <PageCTA title={t.closing} description={t.closingBody}>
        <PublicButton
          href={
            signedIn ? "/app/practice" : "/auth?mode=signup&cta=pricing_close"
          }
        >
          {t.freeCta}
        </PublicButton>
      </PageCTA>
    </main>
  );
}
