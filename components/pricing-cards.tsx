"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { TrackedLink } from "@/components/tracked-link";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import {
  buildPlanCheckoutPath,
  commerceConfig,
  commerceNumbers,
  couponCatalog,
  formatUsd,
  getAnnualMonthlyEquivalent,
  getAnnualSavingsPercentFromWeekly
} from "@/lib/commerce";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function PricingCards() {
  const [billing, setBilling] = useState<"weekly" | "annual">("weekly");
  const { currentUser } = useAppState();
  const isAnnual = billing === "annual";
  const isSignedIn = Boolean(currentUser?.id);
  const currentPlan = currentUser?.plan ?? "free";
  const isPaidUser = currentPlan === "plus" || currentPlan === "pro" || currentPlan === "lifetime";
  const annualMonthlyEquivalent = getAnnualMonthlyEquivalent(commerceNumbers.plusAnnualPrice);
  const annualSavings = getAnnualSavingsPercentFromWeekly(commerceNumbers.plusWeeklyPrice, commerceNumbers.plusAnnualPrice);

  useEffect(() => {
    void trackClientEvent({
      userId: currentUser?.id,
      event: "pricing_view",
      path: "/pricing"
    });
    posthog.capture("pricing_view", { page: "/pricing" });
  }, [currentUser?.id]);

  const trackPlusIntent = () => {
    void trackClientEvent({
      userId: currentUser?.id,
      event: "pricing_plus_click",
      path: `/pricing/plus/${billing}`
    });

    posthog.capture("pricing_plus_click", {
      billing,
      plan: "plus"
    });
  };

  const fireCheckoutGa = () => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    window.gtag("event", "begin_checkout", {
      currency: "USD",
      value: isAnnual ? commerceNumbers.plusAnnualPrice : commerceNumbers.plusWeeklyPrice,
      coupon: couponCatalog.LAUNCH20.code,
      items: [
        {
          item_id: isAnnual ? "plus_annual" : "plus_weekly",
          item_name: isAnnual ? "SpeakAce Plus - Annual" : "SpeakAce Plus - Weekly",
          price: isAnnual ? commerceNumbers.plusAnnualPrice : commerceNumbers.plusWeeklyPrice,
          quantity: 1
        }
      ]
    });
  };

  const plusCtaHref = isPaidUser
    ? "/app/billing"
    : buildPlanCheckoutPath({
        plan: "plus",
        billing,
        coupon: couponCatalog.LAUNCH20.code,
        campaign: "pricing_primary"
      });
  const plusCtaLabel = isPaidUser
    ? `Manage ${currentPlan === "lifetime" ? "Lifetime" : currentPlan === "pro" ? "Pro" : "Plus"}`
    : isSignedIn
      ? isAnnual
        ? "Upgrade this account annually"
        : "Upgrade this account weekly"
      : isAnnual
        ? "Get annual savings"
        : "Unlock full feedback";
  const plusSupportNote = isPaidUser
    ? "Your current account is already paid. Use billing to manage or change plans."
    : isSignedIn
      ? "Checkout upgrades this same account. You can return and keep practicing right away."
      : "Use your first checkout on the same account you plan to practice with.";

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
        <div
          className="card"
          style={{
            display: "inline-flex",
            gap: 0,
            padding: "0.3rem",
            borderRadius: 999,
            background: "var(--surface-strong)"
          }}
        >
          <button
            type="button"
            onClick={() => setBilling("weekly")}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              background: !isAnnual ? "var(--primary)" : "transparent",
              color: !isAnnual ? "#fff" : "var(--muted)",
              transition: "all 0.18s"
            }}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              background: isAnnual ? "var(--primary)" : "transparent",
              color: isAnnual ? "#fff" : "var(--muted)",
              transition: "all 0.18s",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem"
            }}
          >
            Annual
            {!isAnnual ? (
              <span
                style={{
                  background: "rgba(47,125,75,0.14)",
                  color: "var(--success)",
                  borderRadius: 6,
                  padding: "0.1rem 0.5rem",
                  fontSize: "0.78rem",
                  fontWeight: 700
                }}
              >
                Save {annualSavings}%
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="marketing-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <article className="card pricing-card">
          <h3>Free</h3>
          <div className="price-tag">$0</div>
          <div className="practice-meta" style={{ marginBottom: "0.8rem" }}>
            See your score before you pay.
          </div>
          <ul>
            <li>4 daily speaking sessions</li>
            <li>8 daily speaking minutes</li>
            <li>Starter score view and transcript preview</li>
            <li>Enough to test the workflow before upgrading</li>
          </ul>
          <Link className="button button-secondary" href="/auth">
            Start free
          </Link>
        </article>

        <article className="card pricing-card" data-featured="true">
          <div className="pill" style={{ marginBottom: "0.8rem", width: "fit-content" }}>
            {isAnnual ? "Best value for serious prep" : "Best first upgrade"}
          </div>
          <h3>{commerceConfig.plusPlanName}</h3>
          <div className="price-tag">
            {isAnnual ? (
              <>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "var(--muted)",
                    fontSize: "0.85em",
                    fontWeight: 400,
                    marginRight: "0.4rem"
                  }}
                >
                  {commerceConfig.plusMonthlyPrice}/wk
                </span>
                {commerceConfig.plusAnnualPrice}/yr
              </>
            ) : (
              <>{commerceConfig.plusMonthlyPrice}/week</>
            )}
          </div>
          <div className="practice-meta" style={{ marginBottom: "0.8rem" }}>
            {isAnnual
              ? `${commerceConfig.plusAnnualPrice}/year = ${formatUsd(annualMonthlyEquivalent)}/month and ${annualSavings}% less than staying weekly`
              : `${commerceConfig.plusMonthlyPrice}/week = ${formatUsd(commerceNumbers.plusWeeklyPrice * 4)}/month for a lower-friction first step`}
          </div>
          <ul>
            <li>Keep practicing the same day instead of waiting for tomorrow</li>
            <li>Full feedback after every speaking attempt</li>
            <li>18 daily sessions and 35 speaking minutes</li>
            <li>Writing Task 2 scoring with corrected version</li>
            <li>Built for faster IELTS score improvement without private-lesson pricing</li>
            {isAnnual ? <li>Best if your exam prep cycle will last more than a few weeks</li> : <li>Best if you want a lighter first purchase before committing longer-term</li>}
          </ul>
          <TrackedLink
            className="button button-primary"
            href={plusCtaHref}
            userId={currentUser?.id}
            analyticsEvent={isPaidUser ? "pricing_plus_click" : "checkout_initiated"}
            analyticsPath={isPaidUser ? "/pricing/manage-plan" : `/pricing/plus/${billing}`}
            onClick={() => {
              if (isPaidUser) {
                posthog.capture("pricing_manage_plan_click", {
                  billing,
                  current_plan: currentPlan
                });
                return;
              }
              trackPlusIntent();
              fireCheckoutGa();
            }}
          >
            {plusCtaLabel}
          </TrackedLink>
          <div className="practice-meta">Launch offer: use {couponCatalog.LAUNCH20.code} for your first checkout.</div>
          <div className="practice-meta">
            {isAnnual ? "Best for learners who already expect a full exam-prep cycle." : "Cancel anytime. Keep the same account after upgrade."}
          </div>
          <div className="practice-meta">
            {plusSupportNote}
          </div>
        </article>
      </div>

      <div
        className="card"
        style={{
          padding: "1rem 1.1rem",
          display: "grid",
          gap: "0.85rem",
          background: "linear-gradient(135deg, rgba(201,162,39,0.05) 0%, var(--surface) 100%)"
        }}
      >
        <div>
          <strong style={{ display: "block", marginBottom: "0.35rem" }}>Need more than Plus?</strong>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65 }}>
            Advanced plans stay available if you want heavier usage or a long-term commitment, but most first-time buyers should start with Plus.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <a
            className="button button-secondary"
            href={buildPlanCheckoutPath({ plan: "pro", billing: "monthly", campaign: "pricing_advanced_pro_monthly" })}
            onClick={() => {
              posthog.capture("checkout_initiated", { plan: "pro", billing: "monthly", source: "pricing_advanced_pro_monthly" });
            }}
            style={{ borderColor: "#c9a227", color: "#b38600" }}
          >
            View Pro Monthly · {commerceConfig.proMonthlyPrice}/month
          </a>
          <a
            className="button button-secondary"
            href={buildPlanCheckoutPath({ plan: "pro", billing: "annual", campaign: "pricing_advanced_pro_annual" })}
            onClick={() => {
              posthog.capture("checkout_initiated", { plan: "pro", billing: "annual", source: "pricing_advanced_pro_annual" });
            }}
            style={{ borderColor: "#c9a227", color: "#b38600" }}
          >
            View Pro Annual · {commerceConfig.proAnnualPrice}/year
          </a>
          <a
            className="button button-secondary"
            href={buildPlanCheckoutPath({ plan: "lifetime", campaign: "pricing_advanced_lifetime" })}
            onClick={() => {
              posthog.capture("checkout_initiated", { plan: "lifetime", source: "pricing_advanced_lifetime" });
            }}
            style={{ borderColor: "oklch(0.55 0.18 165.41)", color: "oklch(0.45 0.18 165.41)" }}
          >
            View Lifetime · {commerceConfig.lifetimePrice} once
          </a>
        </div>
      </div>
    </div>
  );
}
