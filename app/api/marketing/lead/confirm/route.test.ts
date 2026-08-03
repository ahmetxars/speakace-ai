import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/marketing/lead/confirm/route";
import {
  SCORE_DIAGNOSTIC_MAGNET,
  claimMarketingLeadGuide,
  completeMarketingLeadGuide,
  createMarketingLead,
  resetMarketingLeadMemoryStoreForTests,
  setMarketingLeadFollowupVerification
} from "@/lib/marketing-leads";
import {
  createMarketingLeadConfirmationToken,
  deriveMarketingLeadConfirmationNonce
} from "@/lib/server/marketing-lead-confirmation-token";

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalSecret = process.env.MARKETING_LEAD_CONFIRMATION_SECRET;

async function prepareConfirmation() {
  const lead = await createMarketingLead({
    email: "confirmation@example.test",
    name: "Learner",
    source: "resources_lead",
    magnet: SCORE_DIAGNOSTIC_MAGNET,
    consent: true,
    consentVersion: "ielts-score-diagnostic-nurture-v1"
  });
  expect(await claimMarketingLeadGuide(lead.id)).not.toBeNull();
  const nonce = deriveMarketingLeadConfirmationNonce({
    leadId: lead.id,
    consentGrantedAt: lead.consentGrantedAt
  });
  const confirmation = createMarketingLeadConfirmationToken({
    leadId: lead.id,
    issuedAt: new Date(lead.consentGrantedAt),
    nonce
  });
  expect(await setMarketingLeadFollowupVerification({
    leadId: lead.id,
    nonceHash: confirmation.nonceHash,
    issuedAt: confirmation.issuedAt
  })).toBe(true);
  await completeMarketingLeadGuide(lead.id, true);
  return { lead, confirmation };
}

beforeEach(() => {
  delete process.env.DATABASE_URL;
  process.env.MARKETING_LEAD_CONFIRMATION_SECRET = "route-test-confirmation-secret";
  resetMarketingLeadMemoryStoreForTests();
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalSecret === undefined) delete process.env.MARKETING_LEAD_CONFIRMATION_SECRET;
  else process.env.MARKETING_LEAD_CONFIRMATION_SECRET = originalSecret;
  resetMarketingLeadMemoryStoreForTests();
});

describe("marketing lead follow-up confirmation route", () => {
  it("keeps GET read-only so link scanners cannot activate follow-up email", async () => {
    const { lead, confirmation } = await prepareConfirmation();
    const response = await GET(new NextRequest(
      `https://speakace.org/api/marketing/lead/confirm?token=${encodeURIComponent(confirmation.token)}`
    ));
    const repeated = await createMarketingLead({
      email: lead.email,
      consent: true,
      consentVersion: "ielts-score-diagnostic-nurture-v1"
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(await response.text()).toContain("Opening this page did not subscribe you");
    expect(repeated.followupVerifiedAt).toBeNull();
  });

  it("activates the three-message sequence only after an explicit POST", async () => {
    const { lead, confirmation } = await prepareConfirmation();
    const response = await POST(new NextRequest(
      "https://speakace.org/api/marketing/lead/confirm",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: confirmation.token })
      }
    ));
    const repeated = await createMarketingLead({
      email: lead.email,
      consent: true,
      consentVersion: "ielts-score-diagnostic-nurture-v1"
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Follow-up emails confirmed");
    expect(repeated.followupVerifiedAt).toBeTruthy();
  });

  it("localizes the confirmation screen from the signed email language", async () => {
    const response = await GET(new NextRequest(
      "https://speakace.org/api/marketing/lead/confirm?token=invalid&lang=tr"
    ));

    expect(response.status).toBe(400);
    expect(response.headers.get("content-language")).toBe("tr");
    expect(await response.text()).toContain("Bu onay bağlantısı geçerli değil");
  });
});
