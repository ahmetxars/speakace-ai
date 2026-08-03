import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMarketingLeadConfirmationToken,
  deriveMarketingLeadConfirmationNonce,
  verifyMarketingLeadConfirmationToken
} from "@/lib/server/marketing-lead-confirmation-token";

const leadId = "d20d4595-987e-4d3d-9a0b-a9a95965f36e";
const originalConfirmationSecret = process.env.MARKETING_LEAD_CONFIRMATION_SECRET;
const originalUnsubscribeSecret = process.env.UNSUBSCRIBE_SECRET;
const originalCronSecret = process.env.CRON_SECRET;

beforeEach(() => {
  process.env.MARKETING_LEAD_CONFIRMATION_SECRET = "test-confirmation-secret-with-enough-entropy";
  delete process.env.UNSUBSCRIBE_SECRET;
  delete process.env.CRON_SECRET;
});

afterEach(() => {
  if (originalConfirmationSecret === undefined) delete process.env.MARKETING_LEAD_CONFIRMATION_SECRET;
  else process.env.MARKETING_LEAD_CONFIRMATION_SECRET = originalConfirmationSecret;
  if (originalUnsubscribeSecret === undefined) delete process.env.UNSUBSCRIBE_SECRET;
  else process.env.UNSUBSCRIBE_SECRET = originalUnsubscribeSecret;
  if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalCronSecret;
});

describe("marketing lead confirmation token", () => {
  it("round-trips a signed token without exposing the nonce in stored state", () => {
    const issuedAt = new Date("2026-08-03T10:00:00.000Z");
    const created = createMarketingLeadConfirmationToken({ leadId, issuedAt });
    const verified = verifyMarketingLeadConfirmationToken(
      created.token,
      new Date("2026-08-04T10:00:00.000Z")
    );

    expect(verified).toEqual({
      leadId,
      nonceHash: created.nonceHash,
      issuedAt: issuedAt.toISOString()
    });
    expect(created.token).not.toContain(created.nonceHash);
  });

  it("rejects tampering, excessive age, and tokens issued too far in the future", () => {
    const issuedAt = new Date("2026-08-03T10:00:00.000Z");
    const created = createMarketingLeadConfirmationToken({ leadId, issuedAt });
    const replacement = created.token.endsWith("a") ? "b" : "a";
    const tampered = `${created.token.slice(0, -1)}${replacement}`;

    expect(verifyMarketingLeadConfirmationToken(tampered, issuedAt)).toBeNull();
    expect(verifyMarketingLeadConfirmationToken(
      created.token,
      new Date("2026-09-03T10:00:01.000Z")
    )).toBeNull();
    expect(verifyMarketingLeadConfirmationToken(
      created.token,
      new Date("2026-08-03T09:54:59.000Z")
    )).toBeNull();
  });

  it("derives a different confirmation nonce for every consent epoch", () => {
    const first = deriveMarketingLeadConfirmationNonce({
      leadId,
      consentGrantedAt: "2026-08-03T10:00:00.000Z"
    });
    const repeated = deriveMarketingLeadConfirmationNonce({
      leadId,
      consentGrantedAt: "2026-08-03T10:00:00.000Z"
    });
    const renewed = deriveMarketingLeadConfirmationNonce({
      leadId,
      consentGrantedAt: "2026-08-04T10:00:00.000Z"
    });

    expect(repeated).toBe(first);
    expect(renewed).not.toBe(first);
  });
});
