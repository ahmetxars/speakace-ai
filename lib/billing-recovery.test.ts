import { describe, expect, it } from "vitest";
import {
  buildBillingSyncPendingPath,
  buildCheckoutRecoveryPath,
  CHECKOUT_RECOVERY_WINDOW_SECONDS,
  parseCheckoutRecoveryAttribution
} from "@/lib/billing-recovery";

describe("buildBillingSyncPendingPath", () => {
  it("keeps useful checkout dimensions without exposing transaction identifiers", () => {
    const path = buildBillingSyncPendingPath({
      plan: "plus",
      billing: "weekly",
      ctaPath: "/app/practice/limit-wall",
      campaign: "practice limit"
    });

    expect(path).toBe(
      "/app/billing/success/pending?plan=plus&billing=weekly&source=%2Fapp%2Fpractice%2Flimit-wall&campaign=practice+limit"
    );
    expect(path).not.toContain("checkout");
  });

  it("uses explicit unknown dimensions when attribution is missing", () => {
    expect(buildBillingSyncPendingPath(null)).toBe(
      "/app/billing/success/pending?plan=unknown&billing=unknown&source=unknown"
    );
  });

  it("caps untrusted cookie dimensions before analytics persistence", () => {
    const path = buildBillingSyncPendingPath({
      ctaPath: `/${"a".repeat(120)}`,
      campaign: "b".repeat(120)
    });
    const url = new URL(path, "https://speakace.org");

    expect(url.searchParams.get("source")).toHaveLength(80);
    expect(url.searchParams.get("campaign")).toHaveLength(80);
  });

  it("falls back safely when a modified cookie contains invalid runtime values", () => {
    const path = buildBillingSyncPendingPath({
      plan: "enterprise",
      billing: "monthly",
      ctaPath: { nested: true },
      campaign: 42
    } as unknown as Parameters<typeof buildBillingSyncPendingPath>[0]);

    expect(path).toBe(
      "/app/billing/success/pending?plan=unknown&billing=unknown&source=unknown"
    );
  });

  it("parses an encoded checkout cookie without trusting arbitrary fields", () => {
    const now = Date.parse("2026-08-13T18:00:00.000Z");
    const rawCookie = encodeURIComponent(JSON.stringify({
      plan: "pro",
      billing: "monthly",
      checkoutId: "0f4c0fe4-7760-4ced-a724-ecb5de2ea4d7",
      campaign: "pricing_primary",
      ctaPath: "/pricing/plus",
      ctaEvent: "checkout_initiated",
      createdAt: "2026-08-12T18:00:00.000Z",
      customerEmail: "must-not-survive@example.com"
    }));

    expect(parseCheckoutRecoveryAttribution(rawCookie, now)).toEqual({
      plan: "pro",
      billing: "monthly",
      checkoutId: "0f4c0fe4-7760-4ced-a724-ecb5de2ea4d7",
      campaign: "pricing_primary",
      ctaPath: "/pricing/plus",
      ctaEvent: "checkout_initiated",
      createdAt: "2026-08-12T18:00:00.000Z"
    });
  });

  it("rejects expired, malformed, or non-v4 checkout attribution", () => {
    const now = Date.parse("2026-08-13T18:00:00.000Z");
    const expired = JSON.stringify({
      plan: "plus",
      billing: "weekly",
      checkoutId: "0f4c0fe4-7760-4ced-a724-ecb5de2ea4d7",
      createdAt: new Date(now - (CHECKOUT_RECOVERY_WINDOW_SECONDS + 1) * 1000).toISOString()
    });

    expect(parseCheckoutRecoveryAttribution(expired, now)).toBeNull();
    expect(parseCheckoutRecoveryAttribution("not-json", now)).toBeNull();
    expect(parseCheckoutRecoveryAttribution(JSON.stringify({
      plan: "plus",
      billing: "weekly",
      checkoutId: "customer-controlled-id"
    }), now)).toBeNull();
  });

  it("reuses the checkout id while marking the resumed navigation separately", () => {
    const path = buildCheckoutRecoveryPath({
      plan: "plus",
      billing: "annual",
      checkoutId: "0f4c0fe4-7760-4ced-a724-ecb5de2ea4d7",
      campaign: "homepage_annual"
    }, "/app");
    const url = new URL(path, "https://speakace.org");

    expect(url.pathname).toBe("/api/payments/lemon/checkout");
    expect(url.searchParams.get("plan")).toBe("plus");
    expect(url.searchParams.get("billing")).toBe("annual");
    expect(url.searchParams.get("checkout_id")).toBe("0f4c0fe4-7760-4ced-a724-ecb5de2ea4d7");
    expect(url.searchParams.get("campaign")).toBe("checkout_recovery");
    expect(url.searchParams.get("cta")).toBe("/app/checkout-recovery");
    expect(url.searchParams.get("cta_event")).toBe("checkout_recovery_continued");
  });

  it("preserves Pro monthly billing in pending diagnostics", () => {
    expect(buildBillingSyncPendingPath({ plan: "pro", billing: "monthly" })).toBe(
      "/app/billing/success/pending?plan=pro&billing=monthly&source=unknown"
    );
  });
});
