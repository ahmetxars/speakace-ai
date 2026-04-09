"use client";

import { useState } from "react";
import { buildPlanCheckoutPath, commerceConfig, couponCatalog } from "@/lib/commerce";

export function PricingCards() {
  const [billing, setBilling] = useState<"weekly" | "annual">("weekly");
  const isAnnual = billing === "annual";

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0" }}>
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
            {!isAnnual && (
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
                Save 30%
              </span>
            )}
          </button>
        </div>
      </div>

      {isAnnual && (
        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "0.9rem",
            margin: 0
          }}
        >
          Annual plans include 2 months free. Annual LemonSqueezy products must be configured via{" "}
          <code>LEMON_SQUEEZY_PLUS_ANNUAL_CHECKOUT_URL</code> /
          <code>LEMON_SQUEEZY_PRO_ANNUAL_CHECKOUT_URL</code>.
        </p>
      )}

      {/* Pricing cards */}
      <div className="marketing-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {/* Free */}
        <article className="card pricing-card">
          <h3>Free</h3>
          <div className="price-tag">$0</div>
          <ul>
            <li>4 daily speaking sessions</li>
            <li>8 daily speaking minutes</li>
            <li>Starter score view and limited feedback</li>
          </ul>
          <a className="button button-secondary" href="/auth">
            Start Speaking Now
          </a>
        </article>

        {/* Plus */}
        <article className="card pricing-card" data-featured="true">
          <div className="pill" style={{ marginBottom: "0.8rem", width: "fit-content" }}>
            Most Popular
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
            {isAnnual ? `${commerceConfig.plusAnnualPrice}/year = ~$4/month` : "$3.99/week = ~$16/month"}
          </div>
          <ul>
            <li>18 daily sessions</li>
            <li>35 daily speaking minutes</li>
            <li>Full feedback after each speaking attempt</li>
            <li>Expanded IELTS-style score insight</li>
            <li>Unlimited-feeling retry and improvement workflow</li>
            <li>Built for serious exam score growth</li>
          </ul>
          <a
            className="button button-primary"
            href={buildPlanCheckoutPath({
              plan: "plus",
              billing,
              coupon: couponCatalog.LAUNCH20.code,
              campaign: "pricing_hero"
            })}
          >
            Unlock full feedback
          </a>
          <div className="practice-meta">Try coupon: {couponCatalog.LAUNCH20.code}</div>
          <div className="practice-meta">Cancel anytime. No questions.</div>
        </article>

        {/* Pro */}
        <article
          className="card pricing-card"
          style={{
            border: "2px solid #c9a227",
            background: "linear-gradient(135deg, rgba(201,162,39,0.07) 0%, var(--surface) 100%)"
          }}
        >
          <div
            className="pill"
            style={{
              marginBottom: "0.8rem",
              width: "fit-content",
              background: "rgba(201,162,39,0.18)",
              color: "#b38600",
              border: "1px solid rgba(201,162,39,0.4)"
            }}
          >
            Best Value
          </div>
          <h3>{commerceConfig.proPlanName}</h3>
          <div className="price-tag" style={{ color: "#b38600" }}>
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
                  {commerceConfig.proMonthlyPrice}/mo
                </span>
                {commerceConfig.proAnnualPrice}/yr
              </>
            ) : (
              <>{commerceConfig.proMonthlyPrice}/month</>
            )}
          </div>
          <div className="practice-meta" style={{ marginBottom: "0.8rem" }}>
            {isAnnual
              ? `${commerceConfig.proAnnualPrice}/year = ~$8/month`
              : "$12/month = $2.99/week"}
          </div>
          <ul>
            <li>40 daily sessions</li>
            <li>90 daily speaking minutes</li>
            <li>All Plus features included</li>
            <li>Priority support</li>
            <li>Advanced analytics &amp; score trends</li>
            <li>Maximum practice volume for fast progress</li>
          </ul>
          <a
            className="button button-primary"
            href={buildPlanCheckoutPath({
              plan: "pro",
              billing,
              campaign: "pricing_hero_pro"
            })}
            style={{ background: "#c9a227", borderColor: "#c9a227" }}
          >
            Get Pro
          </a>
          <div className="practice-meta">Cancel anytime. No questions.</div>
        </article>

        {/* Lifetime */}
        <article
          className="card pricing-card"
          style={{
            border: "2px solid oklch(0.71 0.18 165.41)",
            background: "linear-gradient(135deg, oklch(0.71 0.18 165.41 / 0.07) 0%, var(--surface) 100%)"
          }}
        >
          <div
            className="pill"
            style={{
              marginBottom: "0.8rem",
              width: "fit-content",
              background: "oklch(0.71 0.18 165.41 / 0.15)",
              color: "oklch(0.45 0.18 165.41)",
              border: "1px solid oklch(0.71 0.18 165.41 / 0.4)"
            }}
          >
            ⚡ One-time
          </div>
          <h3>{commerceConfig.lifetimePlanName}</h3>
          <div className="price-tag" style={{ color: "oklch(0.45 0.18 165.41)" }}>
            {commerceConfig.lifetimePrice}
            <span style={{ fontSize: "0.5em", fontWeight: 400, color: "var(--muted)", marginLeft: "0.3rem" }}>once</span>
          </div>
          <div className="practice-meta" style={{ marginBottom: "0.8rem" }}>
            Pay once, use forever. No subscriptions.
          </div>
          <ul>
            <li>Everything in Pro, forever</li>
            <li>40 daily sessions</li>
            <li>90 daily speaking minutes</li>
            <li>All future feature updates included</li>
            <li>Priority support, lifetime</li>
            <li>Best deal for serious learners</li>
          </ul>
          <a
            className="button button-primary"
            href={buildPlanCheckoutPath({ plan: "lifetime", campaign: "pricing_hero_lifetime" })}
            style={{ background: "oklch(0.55 0.18 165.41)", borderColor: "oklch(0.55 0.18 165.41)" }}
          >
            Get Lifetime Access
          </a>
          <div className="practice-meta">One payment. Lifetime access. No renewal.</div>
        </article>
      </div>
    </div>
  );
}
