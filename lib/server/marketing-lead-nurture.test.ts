import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SCORE_DIAGNOSTIC_MAGNET,
  createMarketingLead,
  resetMarketingLeadMemoryStoreForTests
} from "@/lib/marketing-leads";
import { resetEmailLifecycleReservationMemoryStoreForTests } from "@/lib/server/email-sequences";
import { deliverMarketingLeadGuide } from "@/lib/server/marketing-lead-nurture";

const managedEnvKeys = [
  "DATABASE_URL",
  "RESEND_API_KEY",
  "MARKETING_LEAD_CONFIRMATION_SECRET",
  "UNSUBSCRIBE_SECRET",
  "CRON_SECRET"
] as const;
const originalEnv = Object.fromEntries(managedEnvKeys.map((key) => [key, process.env[key]]));

describe("marketing lead guide delivery", () => {
  beforeEach(() => {
    for (const key of managedEnvKeys) delete process.env[key];
    process.env.MARKETING_LEAD_CONFIRMATION_SECRET = "queued-lead-test-secret";
    process.env.UNSUBSCRIBE_SECRET = "queued-lead-unsubscribe-secret";
    resetMarketingLeadMemoryStoreForTests();
    resetEmailLifecycleReservationMemoryStoreForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const key of managedEnvKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    resetMarketingLeadMemoryStoreForTests();
    resetEmailLifecycleReservationMemoryStoreForTests();
  });

  it("starts confirmation-token lifetime when an old queued guide is first attempted", async () => {
    vi.setSystemTime(new Date("2026-01-01T09:00:00.000Z"));
    const lead = await createMarketingLead({
      email: "queued@example.test",
      source: "resources_lead",
      magnet: SCORE_DIAGNOSTIC_MAGNET,
      consent: true,
      consentVersion: "ielts-score-diagnostic-nurture-v1"
    });

    vi.setSystemTime(new Date("2026-03-15T09:00:00.000Z"));
    await expect(deliverMarketingLeadGuide(lead.id)).resolves.toEqual({
      status: "queued",
      attempted: true
    });
    const retained = await createMarketingLead({
      email: lead.email,
      consent: true,
      consentVersion: "ielts-score-diagnostic-nurture-v1"
    });

    expect(retained.consentGrantedAt).toBe("2026-01-01T09:00:00.000Z");
    expect(retained.followupVerificationIssuedAt).toBe("2026-03-15T09:00:00.000Z");
  });
});
