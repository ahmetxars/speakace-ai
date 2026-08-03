import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type ConfirmationPayload = {
  v: 1;
  leadId: string;
  issuedAt: number;
  nonce: string;
};

function getSecret() {
  const secret =
    process.env.MARKETING_LEAD_CONFIRMATION_SECRET?.trim() ||
    process.env.UNSUBSCRIBE_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error("MARKETING_LEAD_CONFIRMATION_SECRET, UNSUBSCRIBE_SECRET, or CRON_SECRET must be set.");
  }
  return secret;
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
}

export function hashMarketingLeadConfirmationNonce(nonce: string) {
  return createHash("sha256").update(nonce, "utf8").digest("hex");
}

export function deriveMarketingLeadConfirmationNonce(input: {
  leadId: string;
  consentGrantedAt: string;
}) {
  return createHmac("sha256", getSecret())
    .update(`marketing-lead-confirmation:v1:${input.leadId}:${input.consentGrantedAt}`)
    .digest("base64url");
}

export function createMarketingLeadConfirmationToken(input: {
  leadId: string;
  issuedAt?: Date;
  nonce?: string;
}) {
  const issuedAt = input.issuedAt ?? new Date();
  const nonce = input.nonce ?? randomBytes(32).toString("base64url");
  const payload: ConfirmationPayload = {
    v: 1,
    leadId: input.leadId,
    issuedAt: issuedAt.getTime(),
    nonce
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return {
    token: `${encodedPayload}.${sign(encodedPayload)}`,
    nonceHash: hashMarketingLeadConfirmationNonce(nonce),
    issuedAt: issuedAt.toISOString()
  };
}

export function verifyMarketingLeadConfirmationToken(token: string, now = new Date()) {
  if (!token || token.length > 1000) return null;
  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  try {
    const expected = sign(encodedPayload);
    if (expected.length !== signature.length) return null;
    if (!timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"))) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<ConfirmationPayload>;
    if (
      payload.v !== 1 ||
      typeof payload.leadId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(payload.leadId) ||
      typeof payload.issuedAt !== "number" ||
      !Number.isFinite(payload.issuedAt) ||
      typeof payload.nonce !== "string" ||
      !/^[A-Za-z0-9_-]{32,100}$/.test(payload.nonce)
    ) {
      return null;
    }
    const age = now.getTime() - payload.issuedAt;
    if (age < -5 * 60 * 1000 || age > TOKEN_MAX_AGE_MS) return null;

    return {
      leadId: payload.leadId,
      nonceHash: hashMarketingLeadConfirmationNonce(payload.nonce),
      issuedAt: new Date(payload.issuedAt).toISOString()
    };
  } catch {
    return null;
  }
}
