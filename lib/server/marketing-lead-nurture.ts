import { createHash } from "node:crypto";
import {
  SCORE_DIAGNOSTIC_MAGNET,
  claimMarketingLeadGuide,
  claimMarketingLeadNurtureStep,
  completeMarketingLeadGuide,
  completeMarketingLeadNurtureStep,
  createMarketingLead,
  getMarketingLeadsDueForNurture,
  getMarketingLeadsPendingGuide,
  pruneMarketingLeadData,
  resolveMarketingLeadConsentVersion,
  resolveMarketingLeadMagnet,
  setMarketingLeadFollowupVerification,
  suppressMarketingLead,
  type MarketingLead,
  type MarketingLeadAttribution,
  type MarketingLeadNurtureCandidate
} from "@/lib/marketing-leads";
import {
  isDefiniteEmailRejection,
  isEmailSuppressionError,
  sendInstitutionLeadEmail,
  sendLeadMagnetEmail,
  sendMarketingLeadNurtureEmail,
  sendTeacherLeadEmail
} from "@/lib/server/email";
import {
  completeEmailLifecycleReservation,
  getCurrentEmailQuotaBlock,
  getEmailLifecycleBudgetStatus,
  recordLifecycleEmailAttempt,
  releaseEmailLifecycleReservation,
  reserveEmailLifecycleSend
} from "@/lib/server/email-sequences";
import {
  createMarketingLeadConfirmationToken,
  deriveMarketingLeadConfirmationNonce
} from "@/lib/server/marketing-lead-confirmation-token";

type DeliveryResult = {
  status: "sent" | "deduped" | "queued" | "failed" | "suppressed";
  attempted: boolean;
};

const INITIAL_EMAIL_SUBJECTS: Record<string, string> = {
  "institution-demo": "SpeakAce for your school — what to look at next",
  "teacher-walkthrough": "SpeakAce teacher tools — here's what's included",
  "ielts-speaking-score-diagnostic": "Your IELTS Speaking score diagnostic guide"
};

const NURTURE_EMAIL_SUBJECTS: Record<MarketingLeadNurtureCandidate["nextStep"], string> = {
  1: "Use your transcript as a score map",
  2: "The Band 7 retry rule: change one thing",
  3: "Make score-and-retry your weekly system"
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "unknown email error";
}

function idempotencyKey(parts: Array<string | number>) {
  const digest = createHash("sha256").update(parts.join(":"), "utf8").digest("hex");
  return `speakace-marketing-${digest}`;
}

function initialReservationKey(lead: MarketingLead) {
  // One initial message per consent epoch. Excluding source/magnet prevents an
  // attacker from toggling public form sources to send several messages to one address.
  return idempotencyKey(["guide", lead.id, lead.consentGrantedAt]);
}

function nurtureReservationKey(
  lead: MarketingLead,
  step: MarketingLeadNurtureCandidate["nextStep"]
) {
  return idempotencyKey(["nurture", lead.id, lead.consentGrantedAt, step]);
}

async function prepareDiagnosticConfirmation(lead: MarketingLead) {
  const nonce = deriveMarketingLeadConfirmationNonce({
    leadId: lead.id,
    consentGrantedAt: lead.consentGrantedAt
  });
  const previousIssuedAt = lead.followupVerificationIssuedAt
    ? Date.parse(lead.followupVerificationIssuedAt)
    : Number.NaN;
  const issuedAt = Number.isFinite(previousIssuedAt)
    ? new Date(previousIssuedAt)
    : new Date();
  const confirmation = createMarketingLeadConfirmationToken({
    leadId: lead.id,
    // A lead can sit in a paused or quota-blocked queue for weeks. Start the
    // token lifetime when delivery is first attempted, then reuse that exact
    // timestamp so retries keep an identical provider payload.
    issuedAt,
    nonce
  });
  const stored = await setMarketingLeadFollowupVerification({
    leadId: lead.id,
    nonceHash: confirmation.nonceHash,
    issuedAt: confirmation.issuedAt
  });
  if (!stored) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";
  const locale = ["tr", "de", "es", "fr"].includes(lead.locale ?? "") ? lead.locale : "en";
  return `${siteUrl}/api/marketing/lead/confirm?token=${encodeURIComponent(confirmation.token)}&lang=${locale}`;
}

async function sendInitialValueEmail(
  lead: MarketingLead,
  reservationKey: string,
  confirmationUrl: string | null
) {
  if (lead.magnet === "institution-demo") {
    return sendInstitutionLeadEmail({
      to: lead.email,
      name: lead.name ?? undefined,
      locale: lead.locale ?? undefined,
      idempotencyKey: reservationKey
    });
  }
  if (lead.magnet === "teacher-walkthrough") {
    return sendTeacherLeadEmail({
      to: lead.email,
      name: lead.name ?? undefined,
      locale: lead.locale ?? undefined,
      idempotencyKey: reservationKey
    });
  }
  if (!confirmationUrl) {
    throw new Error("Follow-up confirmation could not be prepared.");
  }
  return sendLeadMagnetEmail({
    to: lead.email,
    name: lead.name ?? undefined,
    locale: lead.locale ?? undefined,
    confirmationUrl,
    idempotencyKey: reservationKey
  });
}

export async function deliverMarketingLeadGuide(leadId: string): Promise<DeliveryResult> {
  const lead = await claimMarketingLeadGuide(leadId);
  if (!lead) {
    return { status: "deduped", attempted: false };
  }

  const subject = INITIAL_EMAIL_SUBJECTS[lead.magnet] ?? INITIAL_EMAIL_SUBJECTS[SCORE_DIAGNOSTIC_MAGNET];
  const template = `marketing_lead_${lead.magnet}`.slice(0, 160);
  const reservationKey = initialReservationKey(lead);
  let confirmationUrl: string | null = null;
  try {
    confirmationUrl = lead.magnet === SCORE_DIAGNOSTIC_MAGNET
      ? await prepareDiagnosticConfirmation(lead)
      : null;
  } catch {
    await completeMarketingLeadGuide(lead.id, false);
    return { status: "queued", attempted: false };
  }

  if (lead.magnet === SCORE_DIAGNOSTIC_MAGNET && !confirmationUrl) {
    await completeMarketingLeadGuide(lead.id, false);
    return { status: "failed", attempted: false };
  }

  const reservation = await reserveEmailLifecycleSend(reservationKey);
  if (!reservation.reserved) {
    if (reservation.reason === "already_sent") {
      await completeMarketingLeadGuide(lead.id, true);
      return { status: "deduped", attempted: false };
    }
    await completeMarketingLeadGuide(lead.id, false);
    return {
      status: reservation.reason === "in_flight" ? "deduped" : "queued",
      attempted: false
    };
  }

  let providerAccepted = false;
  try {
    const result = await sendInitialValueEmail(lead, reservationKey, confirmationUrl);
    providerAccepted = result.ok;
    if (result.ok) {
      await completeEmailLifecycleReservation(reservationKey);
      await completeMarketingLeadGuide(lead.id, true);
    } else {
      await releaseEmailLifecycleReservation(reservationKey);
      await completeMarketingLeadGuide(lead.id, false);
    }
    await recordLifecycleEmailAttempt({
      userEmail: lead.email,
      template,
      subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)",
      reservationKey
    });
    return {
      status: result.ok ? "sent" : "queued",
      attempted: true
    };
  } catch (error) {
    if (!providerAccepted && isDefiniteEmailRejection(error)) {
      await releaseEmailLifecycleReservation(reservationKey).catch(() => undefined);
    }
    const suppressed = isEmailSuppressionError(error);
    if (suppressed) {
      await suppressMarketingLead(lead.id, "provider_suppression");
    } else {
      await completeMarketingLeadGuide(lead.id, false);
    }
    await recordLifecycleEmailAttempt({
      userEmail: lead.email,
      template,
      subject,
      status: "failed",
      errorMessage: errorMessage(error),
      reservationKey
    });
    return {
      status: suppressed ? "suppressed" : "failed",
      attempted: true
    };
  }
}

export async function captureMarketingLead(input: {
  email: string;
  name?: string;
  source?: string;
  consent: true;
  attribution?: MarketingLeadAttribution;
}) {
  const source = input.source?.trim() || "site";
  const magnet = resolveMarketingLeadMagnet(source);
  const lead = await createMarketingLead({
    ...input,
    source,
    magnet,
    consentVersion: resolveMarketingLeadConsentVersion(magnet)
  });

  if (lead.consentRevokedAt || lead.suppressedAt) {
    return {
      leadId: lead.id,
      magnet: lead.magnet,
      delivery: { status: "suppressed", attempted: false } satisfies DeliveryResult
    };
  }

  if (process.env.ENABLE_MARKETING_LEAD_NURTURE === "false" || await getCurrentEmailQuotaBlock()) {
    return {
      leadId: lead.id,
      magnet: lead.magnet,
      delivery: { status: "queued", attempted: false } satisfies DeliveryResult
    };
  }

  const delivery = await deliverMarketingLeadGuide(lead.id);
  return { leadId: lead.id, magnet: lead.magnet, delivery };
}

async function deliverNurtureStep(
  candidate: MarketingLeadNurtureCandidate
): Promise<DeliveryResult> {
  const claimed = await claimMarketingLeadNurtureStep(candidate.id, candidate.nextStep);
  if (!claimed) {
    return { status: "deduped", attempted: false };
  }

  const subject = NURTURE_EMAIL_SUBJECTS[candidate.nextStep];
  const template = `marketing_lead_nurture_${candidate.nextStep}`;
  const reservationKey = nurtureReservationKey(claimed, candidate.nextStep);
  const reservation = await reserveEmailLifecycleSend(reservationKey);
  if (!reservation.reserved) {
    if (reservation.reason === "already_sent") {
      await completeMarketingLeadNurtureStep(claimed.id, candidate.nextStep, true);
      return { status: "deduped", attempted: false };
    }
    await completeMarketingLeadNurtureStep(claimed.id, candidate.nextStep, false);
    return {
      status: reservation.reason === "in_flight" ? "deduped" : "queued",
      attempted: false
    };
  }

  let providerAccepted = false;
  try {
    const result = await sendMarketingLeadNurtureEmail({
      to: claimed.email,
      name: claimed.name ?? undefined,
      locale: claimed.locale ?? undefined,
      step: candidate.nextStep,
      idempotencyKey: reservationKey
    });
    providerAccepted = result.ok;
    if (result.ok) {
      await completeEmailLifecycleReservation(reservationKey);
      await completeMarketingLeadNurtureStep(claimed.id, candidate.nextStep, true);
    } else {
      await releaseEmailLifecycleReservation(reservationKey);
      await completeMarketingLeadNurtureStep(claimed.id, candidate.nextStep, false);
    }
    await recordLifecycleEmailAttempt({
      userEmail: claimed.email,
      template,
      subject,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? undefined : "send skipped (no transport)",
      reservationKey
    });
    return {
      status: result.ok ? "sent" : "queued",
      attempted: true
    };
  } catch (error) {
    if (!providerAccepted && isDefiniteEmailRejection(error)) {
      await releaseEmailLifecycleReservation(reservationKey).catch(() => undefined);
    }
    const suppressed = isEmailSuppressionError(error);
    if (suppressed) {
      await suppressMarketingLead(claimed.id, "provider_suppression");
    } else {
      await completeMarketingLeadNurtureStep(claimed.id, candidate.nextStep, false);
    }
    await recordLifecycleEmailAttempt({
      userEmail: claimed.email,
      template,
      subject,
      status: "failed",
      errorMessage: errorMessage(error),
      reservationKey
    });
    return {
      status: suppressed ? "suppressed" : "failed",
      attempted: true
    };
  }
}

type DeliveryCounters = {
  eligible: number;
  queued: number;
  sent: number;
  deduped: number;
  failed: number;
  suppressed: number;
};

function emptyCounters(queued: number): DeliveryCounters {
  return { eligible: queued, queued, sent: 0, deduped: 0, failed: 0, suppressed: 0 };
}

function countResult(counters: DeliveryCounters, result: DeliveryResult) {
  if (result.status === "sent") {
    counters.queued = Math.max(0, counters.queued - 1);
    counters.sent++;
  }
  if (result.status === "deduped") {
    counters.queued = Math.max(0, counters.queued - 1);
    counters.deduped++;
  }
  if (result.status === "failed") counters.failed++;
  if (result.status === "suppressed") {
    counters.queued = Math.max(0, counters.queued - 1);
    counters.suppressed++;
  }
}

export async function processMarketingLeadNurture(input: {
  limit?: number;
  dryRun?: boolean;
} = {}) {
  const limit = Math.min(Math.max(Math.floor(input.limit ?? 200), 1), 500);
  const dryRun = Boolean(input.dryRun);
  const enabled = process.env.ENABLE_MARKETING_LEAD_NURTURE !== "false";
  const [quotaBlock, budget] = await Promise.all([
    getCurrentEmailQuotaBlock(),
    getEmailLifecycleBudgetStatus()
  ]);
  // Budget status initializes the shared email-log schema in database mode
  // before retention removes expired marketing delivery audit rows.
  const retention = await pruneMarketingLeadData();
  const [pendingGuides, dueNurture] = await Promise.all([
    getMarketingLeadsPendingGuide(limit),
    getMarketingLeadsDueForNurture(limit)
  ]);
  const guide = emptyCounters(pendingGuides.length);
  const nurture = emptyCounters(dueNurture.length);
  let remaining = Math.min(limit, budget.remaining);
  const sendingSuppressed = dryRun || !enabled || Boolean(quotaBlock);

  if (!sendingSuppressed) {
    for (const candidate of pendingGuides) {
      if (remaining <= 0) break;
      const result = await deliverMarketingLeadGuide(candidate.id);
      if (result.attempted) remaining--;
      countResult(guide, result);
    }

    for (const candidate of dueNurture) {
      if (remaining <= 0) break;
      const result = await deliverNurtureStep(candidate);
      if (result.attempted) remaining--;
      countResult(nurture, result);
    }
  }

  return {
    ok: true,
    enabled,
    dryRun,
    sendingSuppressed,
    emailQuota: quotaBlock
      ? { blocked: true as const, kind: quotaBlock.kind, detectedAt: quotaBlock.detectedAt }
      : { blocked: false as const },
    lifecycleBudget: {
      limit: budget.limit,
      sentToday: budget.sentToday,
      attemptsRemaining: remaining
    },
    retention,
    guide,
    nurture
  };
}
