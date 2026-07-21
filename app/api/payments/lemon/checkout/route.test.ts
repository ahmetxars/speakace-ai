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
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
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
    expect(response.headers.get("location")).toContain("speakace.lemonsqueezy.com/checkout/buy/");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith({
      userId: "user-1",
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
      event: "checkout_initiated",
      path: "/api/payments/lemon/checkout?plan=plus&billing=annual&campaign=billing_decision_annual"
    });
  });
});
