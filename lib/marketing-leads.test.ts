import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SCORE_DIAGNOSTIC_MAGNET,
  claimMarketingLeadGuide,
  claimMarketingLeadNurtureStep,
  completeMarketingLeadGuide,
  completeMarketingLeadNurtureStep,
  confirmMarketingLeadFollowup,
  createMarketingLead,
  getMarketingLeadsDueForNurture,
  getMarketingLeadsPendingGuide,
  pruneMarketingLeadData,
  resetMarketingLeadMemoryStoreForTests,
  resolveMarketingLeadConsentVersion,
  resolveMarketingLeadMagnet,
  revokeMarketingLeadConsent,
  setMarketingLeadFollowupVerification,
  type MarketingLead
} from "@/lib/marketing-leads";

const originalDatabaseUrl = process.env.DATABASE_URL;

function createLead(email = "learner@example.test", magnet = SCORE_DIAGNOSTIC_MAGNET) {
  return createMarketingLead({
    email,
    name: "Learner",
    source: "resources_lead",
    magnet,
    consent: true,
    consentVersion: resolveMarketingLeadConsentVersion(magnet),
    attribution: {
      landingPath: "/resources",
      utmSource: "instagram",
      utmMedium: "organic_social",
      utmCampaign: "speaking_score_retry_4w"
    }
  });
}

async function deliverGuideAndConfirm(
  lead: MarketingLead,
  nonceHash = "a".repeat(64),
  issuedAt = new Date().toISOString()
) {
  expect(await claimMarketingLeadGuide(lead.id)).not.toBeNull();
  expect(await setMarketingLeadFollowupVerification({ leadId: lead.id, nonceHash, issuedAt })).toBe(true);
  await completeMarketingLeadGuide(lead.id, true);
  const confirmed = await confirmMarketingLeadFollowup({ leadId: lead.id, nonceHash, issuedAt });
  expect(confirmed.ok).toBe(true);
  if (!confirmed.ok) throw new Error("Expected marketing follow-up confirmation to succeed.");
  if (!confirmed.verifiedAt) throw new Error("Expected a follow-up verification timestamp.");
  return confirmed.verifiedAt;
}

beforeEach(() => {
  delete process.env.DATABASE_URL;
  resetMarketingLeadMemoryStoreForTests();
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
  resetMarketingLeadMemoryStoreForTests();
});

describe("marketing lead consent and delivery", () => {
  it("stores source attribution and deduplicates the immediate guide", async () => {
    const lead = await createLead();

    expect(lead.consentGrantedAt).toBeTruthy();
    expect(lead.consentRevokedAt).toBeNull();
    expect(lead.utmSource).toBe("instagram");
    expect(await getMarketingLeadsPendingGuide()).toHaveLength(1);

    const firstClaim = await claimMarketingLeadGuide(lead.id);
    const duplicateClaim = await claimMarketingLeadGuide(lead.id);
    expect(firstClaim?.id).toBe(lead.id);
    expect(duplicateClaim).toBeNull();

    await completeMarketingLeadGuide(lead.id, true);
    expect(await getMarketingLeadsPendingGuide()).toHaveLength(0);

    const repeatedRequest = await createLead();
    expect(repeatedRequest.leadMagnetSentAt).toBeTruthy();
    expect(await claimMarketingLeadGuide(lead.id)).toBeNull();
  });

  it("locks an active recipient to the original identity, source, magnet, and consent epoch", async () => {
    const lead = await createLead();
    const verifiedAt = await deliverGuideAndConfirm(lead);

    const changed = await createMarketingLead({
      email: lead.email,
      name: "Attacker supplied name",
      source: "schools_demo",
      magnet: "institution-demo",
      consent: true,
      consentVersion: "institution-demo-followup-v1",
      attribution: { utmSource: "tampered", landingPath: "/schools" }
    });

    expect(changed.name).toBe("Learner");
    expect(changed.source).toBe("resources_lead");
    expect(changed.magnet).toBe(SCORE_DIAGNOSTIC_MAGNET);
    expect(changed.consentGrantedAt).toBe(lead.consentGrantedAt);
    expect(changed.followupVerifiedAt).toBe(verifiedAt);
    expect(changed.utmSource).toBe("instagram");
    expect(changed.leadMagnetSentAt).toBeTruthy();
    expect(changed.nurtureStep).toBe(0);
    expect(await claimMarketingLeadGuide(lead.id)).toBeNull();
  });

  it("advances the nurture sequence only after a successful claimed send", async () => {
    const lead = await createLead();
    const verifiedAt = await deliverGuideAndConfirm(lead);

    const afterTwoDays = new Date(Date.parse(verifiedAt) + 2 * 24 * 60 * 60 * 1000 + 60_000);
    const firstDue = await getMarketingLeadsDueForNurture(10, afterTwoDays);
    expect(firstDue).toHaveLength(1);
    expect(firstDue[0].nextStep).toBe(1);

    expect(await claimMarketingLeadNurtureStep(lead.id, 1)).not.toBeNull();
    await completeMarketingLeadNurtureStep(lead.id, 1, false);
    expect((await getMarketingLeadsDueForNurture(10, afterTwoDays))[0].nextStep).toBe(1);

    expect(await claimMarketingLeadNurtureStep(lead.id, 1)).not.toBeNull();
    await completeMarketingLeadNurtureStep(lead.id, 1, true);
    const afterFourDays = new Date(Date.parse(verifiedAt) + 4 * 24 * 60 * 60 * 1000 + 60_000);
    expect((await getMarketingLeadsDueForNurture(10, afterFourDays))[0].nextStep).toBe(2);
  });

  it("does not schedule nurture until the recipient explicitly confirms", async () => {
    const lead = await createLead();
    expect(await claimMarketingLeadGuide(lead.id)).not.toBeNull();
    const issuedAt = new Date().toISOString();
    expect(await setMarketingLeadFollowupVerification({
      leadId: lead.id,
      nonceHash: "b".repeat(64),
      issuedAt
    })).toBe(true);
    await completeMarketingLeadGuide(lead.id, true);

    expect(await getMarketingLeadsDueForNurture(
      10,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    )).toHaveLength(0);
  });

  it("reconciles an accepted guide after an application crash when its recipient confirms", async () => {
    const lead = await createLead();
    expect(await claimMarketingLeadGuide(lead.id)).not.toBeNull();
    const issuedAt = new Date().toISOString();
    const verification = { leadId: lead.id, nonceHash: "c".repeat(64), issuedAt };
    expect(await setMarketingLeadFollowupVerification(verification)).toBe(true);

    const first = await confirmMarketingLeadFollowup(verification);
    const repeated = await confirmMarketingLeadFollowup(verification);
    expect(first.ok).toBe(true);
    expect(repeated).toEqual(first);
    expect((await createLead()).leadMagnetSentAt).toBeTruthy();
    expect(await claimMarketingLeadGuide(lead.id)).toBeNull();
  });

  it("removes a revoked lead from pending guide and nurture delivery", async () => {
    const lead = await createLead();
    await revokeMarketingLeadConsent(lead.email);

    expect(await getMarketingLeadsPendingGuide()).toHaveLength(0);
    expect(await claimMarketingLeadGuide(lead.id)).toBeNull();
    expect(await getMarketingLeadsDueForNurture(10, new Date(Date.now() + 10 * 24 * 60 * 60 * 1000))).toHaveLength(0);
  });

  it("keeps unsubscribe durable and removes optional identity and attribution data", async () => {
    const lead = await createLead();
    expect(await claimMarketingLeadGuide(lead.id)).not.toBeNull();
    await completeMarketingLeadGuide(lead.id, true);
    await revokeMarketingLeadConsent(lead.email);

    const repeatedPublicRequest = await createLead(lead.email, "teacher-walkthrough");
    expect(repeatedPublicRequest.consentRevokedAt).toBeTruthy();
    expect(repeatedPublicRequest.name).toBeNull();
    expect(repeatedPublicRequest.locale).toBeNull();
    expect(repeatedPublicRequest.landingPath).toBeNull();
    expect(repeatedPublicRequest.referrerHost).toBeNull();
    expect(repeatedPublicRequest.utmSource).toBeNull();
    expect(repeatedPublicRequest.utmMedium).toBeNull();
    expect(repeatedPublicRequest.utmCampaign).toBeNull();
    expect(repeatedPublicRequest.magnet).toBe(SCORE_DIAGNOSTIC_MAGNET);
    expect(await claimMarketingLeadGuide(repeatedPublicRequest.id)).toBeNull();
  });

  it("invalidates a pending confirmation as soon as consent is revoked", async () => {
    const lead = await createLead();
    expect(await claimMarketingLeadGuide(lead.id)).not.toBeNull();
    const verification = {
      leadId: lead.id,
      nonceHash: "d".repeat(64),
      issuedAt: new Date().toISOString()
    };
    expect(await setMarketingLeadFollowupVerification(verification)).toBe(true);
    await completeMarketingLeadGuide(lead.id, true);
    await revokeMarketingLeadConsent(lead.email);

    expect(await confirmMarketingLeadFollowup(verification)).toEqual({ ok: false });
  });

  it("minimizes unconfirmed lead data after 30 days and preserves a durable opt-out record", async () => {
    const lead = await createLead("retention@example.test");
    const result = await pruneMarketingLeadData(
      new Date(Date.parse(lead.createdAt) + 31 * 24 * 60 * 60 * 1000)
    );
    const retained = await createLead(lead.email);

    expect(result).toEqual({ leadsMinimized: 1, deliveryAuditRowsDeleted: 0 });
    expect(retained.consentRevokedAt).toBeTruthy();
    expect(retained.name).toBeNull();
    expect(retained.landingPath).toBeNull();
    expect(retained.utmSource).toBeNull();
    expect(await claimMarketingLeadGuide(lead.id)).toBeNull();
  });

  it("routes source-specific requests to the correct consent purpose", () => {
    expect(resolveMarketingLeadMagnet("schools_demo")).toBe("institution-demo");
    expect(resolveMarketingLeadMagnet("teachers_demo")).toBe("teacher-walkthrough");
    expect(resolveMarketingLeadMagnet("footer_newsletter")).toBe(SCORE_DIAGNOSTIC_MAGNET);
    expect(resolveMarketingLeadMagnet("attacker_school_variant")).toBe(SCORE_DIAGNOSTIC_MAGNET);
  });
});
