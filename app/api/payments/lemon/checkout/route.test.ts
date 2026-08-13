import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  trackAnalyticsEvent: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mocks.cookieGet }))
}));

vi.mock("@/lib/server/auth", () => ({
  getSessionCookieName: () => "speakace_session",
  getAuthenticatedUser: mocks.getAuthenticatedUser
}));

vi.mock("@/lib/analytics-store", () => ({
  trackAnalyticsEvent: mocks.trackAnalyticsEvent
}));

import { GET } from "@/app/api/payments/lemon/checkout/route";

function checkoutNavigationRequest(url: string) {
  return new Request(url, {
    headers: {
      "sec-fetch-mode": "navigate",
      "sec-fetch-dest": "document",
      "sec-fetch-user": "?1"
    }
  });
}

describe("Lemon checkout redirect", () => {
  beforeEach(() => {
    mocks.cookieGet.mockReset();
    mocks.getAuthenticatedUser.mockReset();
    mocks.trackAnalyticsEvent.mockReset();
    mocks.cookieGet.mockImplementation((name: string) =>
      name === "speakace_session"
        ? { value: "session-token" }
        : { value: "visitor-1234567890" }
    );
    mocks.getAuthenticatedUser.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com",
      name: "Learner"
    });
  });

  it("records an authenticated checkout from its attributed CTA", async () => {
    const response = await GET(
      checkoutNavigationRequest(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&cta=%2Fpricing%2Fplus%2Fweekly&campaign=pricing_primary"
      )
    );

    expect(response.status).toBe(307);
    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(checkoutUrl.href).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(checkoutUrl.searchParams.get("checkout[custom][plan]")).toBe("plus");
    expect(checkoutUrl.searchParams.get("checkout[custom][billing]")).toBe("weekly");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        visitorId: "visitor-1234567890",
        event: "checkout_initiated",
        path: "/pricing/plus/weekly",
        eventId: expect.any(String),
        source: "verified_navigation:pricing_primary",
        plan: "plus",
        occurredAt: expect.any(String)
      })
    );
  });

  it("never blocks checkout when analytics storage fails", async () => {
    mocks.trackAnalyticsEvent.mockRejectedValueOnce(new Error("analytics unavailable"));

    const response = await GET(
      checkoutNavigationRequest(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=billing_decision_annual"
      )
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        visitorId: "visitor-1234567890",
        event: "checkout_initiated",
        path: "/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=billing_decision_annual",
        eventId: expect.any(String),
        source: "verified_navigation:billing_decision_annual",
        plan: "plus",
        occurredAt: expect.any(String)
      })
    );
  });

  it("sends an anonymous buyer directly to checkout with attribution intact", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(
      checkoutNavigationRequest(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&cta=%2Fpricing%2Fplus%2Fweekly"
      )
    );

    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(response.status).toBe(307);
    expect(checkoutUrl.href).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(checkoutUrl.searchParams.get("checkout[custom][plan]")).toBe("plus");
    expect(checkoutUrl.searchParams.get("checkout[custom][billing]")).toBe("weekly");
    expect(checkoutUrl.searchParams.get("checkout[custom][visitor_id]")).toBe("visitor-1234567890");
    expect(checkoutUrl.searchParams.get("checkout[custom][checkout_id]")).toMatch(/^[0-9a-f-]{36}$/i);
    expect(checkoutUrl.searchParams.get("checkout[custom][user_id]")).toBeNull();
    expect(checkoutUrl.searchParams.get("checkout[email]")).toBeNull();
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: undefined,
        visitorId: "visitor-1234567890",
        event: "checkout_initiated",
        path: "/pricing/plus/weekly",
        eventId: expect.any(String),
        plan: "plus",
        occurredAt: expect.any(String)
      })
    );
  });

  it("reuses the checkout id after authentication for purchase deduplication", async () => {
    const checkoutId = "0f4c0fe4-7760-4ced-a724-ecb5de2ea4d7";
    const response = await GET(
      checkoutNavigationRequest(
        `https://speakace.org/api/payments/lemon/checkout?plan=plus&checkout_id=${checkoutId}`
      )
    );

    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(checkoutUrl.searchParams.get("checkout[custom][checkout_id]")).toBe(checkoutId);
    expect(checkoutUrl.searchParams.get("checkout[custom][user_id]")).toBe("user-1");
    expect(checkoutUrl.searchParams.get("checkout[email]")).toBe("learner@example.com");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: checkoutId })
    );
    const recoveryCookie = response.cookies.get("speakace_checkout_attribution");
    const recoveryPayload = JSON.parse(recoveryCookie?.value ?? "{}") as Record<string, unknown>;
    expect(recoveryCookie?.maxAge).toBe(60 * 60 * 72);
    expect(recoveryPayload).toEqual(expect.objectContaining({
      plan: "plus",
      billing: "weekly",
      checkoutId,
      createdAt: expect.any(String)
    }));
  });

  it("redirects prefetches and scanners without counting checkout intent", async () => {
    const response = await GET(
      new Request(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&campaign=homepage_annual",
        {
          headers: {
            purpose: "prefetch",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty"
          }
        }
      )
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("routes Pro buyers to the monthly offer by default", async () => {
    const response = await GET(
      new Request("https://speakace.org/api/payments/lemon/checkout?plan=pro")
    );

    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(checkoutUrl.searchParams.get("checkout[custom][plan]")).toBe("pro");
    expect(checkoutUrl.searchParams.get("checkout[custom][billing]")).toBe("monthly");
    expect(checkoutUrl.href).toContain("f2a9b0dd-88f7-48b9-9b3b-2069b2324cc7");
  });

  it("keeps the Pro annual offer available when explicitly requested", async () => {
    const response = await GET(
      new Request("https://speakace.org/api/payments/lemon/checkout?plan=pro&billing=annual")
    );

    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(checkoutUrl.searchParams.get("checkout[custom][billing]")).toBe("annual");
    expect(checkoutUrl.href).toContain("a00764fa-adb5-4245-97ef-6f2f9d5c0bb6");
  });
});
