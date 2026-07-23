import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  getAuthenticatedUserFromCookies: vi.fn(),
  trackAnalyticsEvent: vi.fn(),
  checkRateLimit: vi.fn(),
  getRequestIp: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mocks.cookieGet }))
}));

vi.mock("@/lib/server/auth", () => ({
  getAuthenticatedUserFromCookies: mocks.getAuthenticatedUserFromCookies
}));

vi.mock("@/lib/analytics-store", () => ({
  trackAnalyticsEvent: mocks.trackAnalyticsEvent
}));

vi.mock("@/lib/server/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRequestIp: mocks.getRequestIp,
  rateLimitResponse: vi.fn(() => new Response(null, { status: 429 }))
}));

import { POST } from "@/app/api/analytics/track/route";

function analyticsRequest(event: string, path = "/pricing") {
  return new Request("https://speakace.org/api/analytics/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, path })
  });
}

describe("analytics tracking policy", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.cookieGet.mockReturnValue({ value: "visitor-1234567890" });
    mocks.getAuthenticatedUserFromCookies.mockResolvedValue(null);
    mocks.checkRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.getRequestIp.mockReturnValue("127.0.0.1");
  });

  it("records public pricing events without requiring an account", async () => {
    const response = await POST(analyticsRequest("pricing_view"));

    expect(response.status).toBe(200);
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith({
      userId: undefined,
      visitorId: "visitor-1234567890",
      event: "pricing_view",
      path: "/pricing"
    });
  });

  it("requires authentication for learner product events", async () => {
    const response = await POST(analyticsRequest("practice_start", "/app/practice"));

    expect(response.status).toBe(401);
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("rejects client-side purchase completion events", async () => {
    mocks.getAuthenticatedUserFromCookies.mockResolvedValue({ id: "user-1" });

    const response = await POST(analyticsRequest("checkout_completed", "/pricing"));

    expect(response.status).toBe(400);
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("records authenticated learner events with the same visitor id", async () => {
    mocks.getAuthenticatedUserFromCookies.mockResolvedValue({ id: "user-1" });

    const response = await POST(analyticsRequest("practice_start", "/app/practice"));

    expect(response.status).toBe(200);
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith({
      userId: "user-1",
      visitorId: "visitor-1234567890",
      event: "practice_start",
      path: "/app/practice"
    });
  });
});
