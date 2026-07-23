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
      new Request(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&cta=%2Fpricing%2Fplus%2Fweekly&campaign=pricing_primary"
      )
    );

    expect(response.status).toBe(307);
    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(checkoutUrl.href).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(checkoutUrl.searchParams.get("checkout[custom][plan]")).toBe("plus");
    expect(checkoutUrl.searchParams.get("checkout[custom][billing]")).toBe("weekly");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith({
      userId: "user-1",
      visitorId: "visitor-1234567890",
      event: "checkout_initiated",
      path: "/pricing/plus/weekly"
    });
  });

  it("never blocks checkout when analytics storage fails", async () => {
    mocks.trackAnalyticsEvent.mockRejectedValueOnce(new Error("analytics unavailable"));

    const response = await GET(
      new Request(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=billing_decision_annual"
      )
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith({
      userId: "user-1",
      visitorId: "visitor-1234567890",
      event: "checkout_initiated",
      path: "/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=billing_decision_annual"
    });
  });

  it("records anonymous checkout intent with a privacy-safe visitor id", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "https://speakace.org/api/payments/lemon/checkout?plan=plus&cta=%2Fpricing%2Fplus%2Fweekly"
      )
    );

    const checkoutUrl = new URL(response.headers.get("location") ?? "");
    expect(response.status).toBe(307);
    expect(checkoutUrl.searchParams.get("checkout[custom][visitor_id]")).toBe("visitor-1234567890");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith({
      userId: undefined,
      visitorId: "visitor-1234567890",
      event: "checkout_initiated",
      path: "/pricing/plus/weekly"
    });
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
