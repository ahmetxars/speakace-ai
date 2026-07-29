import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes
} from "node:crypto";

export type LifecycleEmailCampaign = "daily_tip";

type LifecycleEmailPayload = {
  version: 1;
  userId: string;
  campaign: LifecycleEmailCampaign;
  issuedAt: number;
  expiresAt: number;
};

const TOKEN_VERSION = 1;
const TOKEN_IV_BYTES = 12;
const TOKEN_TAG_BYTES = 16;
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakace.org";

const CAMPAIGN_DESTINATIONS: Record<LifecycleEmailCampaign, string> = {
  daily_tip: "/app/practice?quickStart=1&runMode=drill&activation=email_daily_tip"
};

function getEncryptionKey() {
  const secret = process.env.UNSUBSCRIBE_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error("UNSUBSCRIBE_SECRET or CRON_SECRET must be set.");
  }
  return createHash("sha256").update(secret).digest();
}

function isLifecycleEmailCampaign(value: unknown): value is LifecycleEmailCampaign {
  return value === "daily_tip";
}

export function generateLifecycleEmailToken(input: {
  userId: string;
  campaign: LifecycleEmailCampaign;
  now?: Date;
}) {
  const userId = input.userId.trim();
  if (!/^[a-zA-Z0-9:_-]{1,80}$/.test(userId)) {
    throw new Error("A valid user id is required for lifecycle email attribution.");
  }

  const issuedAt = (input.now ?? new Date()).getTime();
  const payload: LifecycleEmailPayload = {
    version: TOKEN_VERSION,
    userId,
    campaign: input.campaign,
    issuedAt,
    expiresAt: issuedAt + TOKEN_MAX_AGE_MS
  };
  const iv = randomBytes(TOKEN_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([
    Buffer.from([TOKEN_VERSION]),
    iv,
    tag,
    encrypted
  ]).toString("base64url");
}

export function verifyLifecycleEmailToken(token: string, now = new Date()): LifecycleEmailPayload | null {
  if (!token || token.length > 1200) return null;

  try {
    const buffer = Buffer.from(token, "base64url");
    const minimumLength = 1 + TOKEN_IV_BYTES + TOKEN_TAG_BYTES + 2;
    if (buffer.length < minimumLength || buffer[0] !== TOKEN_VERSION) return null;

    const ivStart = 1;
    const tagStart = ivStart + TOKEN_IV_BYTES;
    const encryptedStart = tagStart + TOKEN_TAG_BYTES;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      buffer.subarray(ivStart, tagStart)
    );
    decipher.setAuthTag(buffer.subarray(tagStart, encryptedStart));
    const decrypted = Buffer.concat([
      decipher.update(buffer.subarray(encryptedStart)),
      decipher.final()
    ]).toString("utf8");
    const payload = JSON.parse(decrypted) as Partial<LifecycleEmailPayload>;
    const issuedAt = payload.issuedAt;
    const expiresAt = payload.expiresAt;

    if (
      payload.version !== TOKEN_VERSION ||
      !/^[a-zA-Z0-9:_-]{1,80}$/.test(payload.userId ?? "") ||
      !isLifecycleEmailCampaign(payload.campaign) ||
      typeof issuedAt !== "number" ||
      !Number.isFinite(issuedAt) ||
      typeof expiresAt !== "number" ||
      !Number.isFinite(expiresAt)
    ) {
      return null;
    }

    const nowTime = now.getTime();
    if (
      issuedAt > nowTime + 1000 * 60 * 5 ||
      expiresAt < nowTime ||
      expiresAt - issuedAt !== TOKEN_MAX_AGE_MS
    ) {
      return null;
    }

    return payload as LifecycleEmailPayload;
  } catch {
    return null;
  }
}

export function getLifecycleEmailDestination(campaign: LifecycleEmailCampaign) {
  return CAMPAIGN_DESTINATIONS[campaign];
}

export function buildLifecycleEmailClickUrl(input: {
  userId: string;
  campaign: LifecycleEmailCampaign;
  now?: Date;
}) {
  const url = new URL("/api/email/continue", SITE_URL);
  url.searchParams.set("token", generateLifecycleEmailToken(input));
  return url.toString();
}
