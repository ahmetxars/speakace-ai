import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isMarketingLeadPersistenceAvailable: vi.fn(),
  processMarketingLeadNurture: vi.fn()
}));

vi.mock("@/lib/marketing-leads", () => ({
  isMarketingLeadPersistenceAvailable: mocks.isMarketingLeadPersistenceAvailable
}));

vi.mock("@/lib/server/marketing-lead-nurture", () => ({
  processMarketingLeadNurture: mocks.processMarketingLeadNurture
}));

import { GET } from "@/app/api/cron/marketing-lead-nurture/route";

describe("marketing lead cron authorization", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.isMarketingLeadPersistenceAvailable.mockReturnValue(true);
    mocks.processMarketingLeadNurture.mockResolvedValue({ ok: true });
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "");
    vi.stubEnv("CRON_SECRET", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not trust a spoofed cron header in production without a secret", async () => {
    const response = await GET(new Request(
      "https://speakace.org/api/cron/marketing-lead-nurture",
      { headers: { "x-vercel-cron": "1" } }
    ));

    expect(response.status).toBe(401);
    expect(mocks.processMarketingLeadNurture).not.toHaveBeenCalled();
  });

  it("accepts only the configured bearer secret in production", async () => {
    vi.stubEnv("CRON_SECRET", "cron-test-secret");
    const denied = await GET(new Request(
      "https://speakace.org/api/cron/marketing-lead-nurture",
      { headers: { authorization: "Bearer wrong" } }
    ));
    const accepted = await GET(new Request(
      "https://speakace.org/api/cron/marketing-lead-nurture?limit=5",
      { headers: { authorization: "Bearer cron-test-secret" } }
    ));

    expect(denied.status).toBe(401);
    expect(accepted.status).toBe(200);
    expect(mocks.processMarketingLeadNurture).toHaveBeenCalledWith({ limit: 5, dryRun: false });
  });
});
