import { describe, expect, it } from "vitest";
import { buildBillingSyncPendingPath } from "@/lib/billing-recovery";

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
});
