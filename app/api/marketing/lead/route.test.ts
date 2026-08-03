import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  captureMarketingLead: vi.fn(),
  isMarketingLeadPersistenceAvailable: vi.fn(),
  checkRateLimit: vi.fn(),
  getRequestIp: vi.fn()
}));

vi.mock("@/lib/marketing-leads", () => ({
  isMarketingLeadPersistenceAvailable: mocks.isMarketingLeadPersistenceAvailable
}));

vi.mock("@/lib/server/marketing-lead-nurture", () => ({
  captureMarketingLead: mocks.captureMarketingLead
}));

vi.mock("@/lib/server/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRequestIp: mocks.getRequestIp,
  rateLimitResponse: (retryAfterSeconds: number) => new Response(
    JSON.stringify({ error: "Too many requests." }),
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  )
}));

import { POST } from "@/app/api/marketing/lead/route";

function leadRequest(overrides: Record<string, unknown> = {}) {
  return new NextRequest("https://speakace.org/api/marketing/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "learner@example.test",
      name: "Learner",
      source: "resources_lead",
      consent: true,
      ...overrides
    })
  });
}

describe("public marketing lead route", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.getRequestIp.mockReturnValue("203.0.113.10");
    mocks.checkRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.isMarketingLeadPersistenceAvailable.mockReturnValue(true);
    mocks.captureMarketingLead.mockResolvedValue({
      leadId: "lead-1",
      magnet: "ielts-speaking-score-diagnostic",
      delivery: { status: "sent", attempted: true }
    });
  });

  it("returns the same generic response for every internal delivery state", async () => {
    const sentResponse = await POST(leadRequest());
    mocks.captureMarketingLead.mockResolvedValueOnce({
      leadId: "lead-1",
      magnet: "ielts-speaking-score-diagnostic",
      delivery: { status: "suppressed", attempted: false }
    });
    const suppressedResponse = await POST(leadRequest());

    await expect(sentResponse.json()).resolves.toEqual({ ok: true });
    await expect(suppressedResponse.json()).resolves.toEqual({ ok: true });
    expect(sentResponse.headers.get("cache-control")).toBe("no-store");
  });

  it("fails closed when durable production persistence is unavailable", async () => {
    mocks.isMarketingLeadPersistenceAvailable.mockReturnValue(false);
    const response = await POST(leadRequest());

    expect(response.status).toBe(503);
    expect(mocks.captureMarketingLead).not.toHaveBeenCalled();
  });

  it("keeps the honeypot response generic without creating a lead", async () => {
    const response = await POST(leadRequest({ company: "bot value" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.captureMarketingLead).not.toHaveBeenCalled();
  });
});
