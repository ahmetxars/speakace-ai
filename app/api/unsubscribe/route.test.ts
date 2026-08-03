import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isMarketingLeadPersistenceAvailable: vi.fn(),
  revokeMarketingConsentEverywhere: vi.fn(),
  checkRateLimit: vi.fn(),
  getRequestIp: vi.fn(),
  verifyUnsubscribeToken: vi.fn()
}));

vi.mock("@/lib/marketing-leads", () => ({
  isMarketingLeadPersistenceAvailable: mocks.isMarketingLeadPersistenceAvailable,
  revokeMarketingConsentEverywhere: mocks.revokeMarketingConsentEverywhere
}));

vi.mock("@/lib/server/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRequestIp: mocks.getRequestIp,
  rateLimitResponse: (retryAfterSeconds: number) => new Response(
    JSON.stringify({ error: "Too many requests." }),
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  )
}));

vi.mock("@/lib/server/unsubscribe-token", () => ({
  verifyUnsubscribeToken: mocks.verifyUnsubscribeToken
}));

import { POST } from "@/app/api/unsubscribe/route";

function unsubscribeRequest() {
  return new NextRequest("https://speakace.org/api/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "learner@example.test", token: "signed-token" })
  });
}

describe("unsubscribe route", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.getRequestIp.mockReturnValue("203.0.113.10");
    mocks.checkRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.verifyUnsubscribeToken.mockReturnValue(true);
    mocks.isMarketingLeadPersistenceAvailable.mockReturnValue(true);
    mocks.revokeMarketingConsentEverywhere.mockResolvedValue(undefined);
  });

  it("lets a valid signed request bypass shared-IP rate limiting", async () => {
    const response = await POST(unsubscribeRequest());

    expect(response.status).toBe(200);
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
    expect(mocks.revokeMarketingConsentEverywhere).toHaveBeenCalledWith("learner@example.test");
  });

  it("rate-limits invalid tokens without changing consent", async () => {
    mocks.verifyUnsubscribeToken.mockReturnValue(false);
    const response = await POST(unsubscribeRequest());

    expect(response.status).toBe(400);
    expect(mocks.checkRateLimit).toHaveBeenCalledOnce();
    expect(mocks.revokeMarketingConsentEverywhere).not.toHaveBeenCalled();
  });

  it("fails closed when persistence is unavailable or the atomic revoke fails", async () => {
    mocks.isMarketingLeadPersistenceAvailable.mockReturnValue(false);
    const unavailable = await POST(unsubscribeRequest());
    expect(unavailable.status).toBe(503);

    mocks.isMarketingLeadPersistenceAvailable.mockReturnValue(true);
    mocks.revokeMarketingConsentEverywhere.mockRejectedValueOnce(new Error("transaction failed"));
    const failed = await POST(unsubscribeRequest());
    expect(failed.status).toBe(503);
  });
});
