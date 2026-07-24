import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error("UNSUBSCRIBE_SECRET or CRON_SECRET must be set.");
  }
  return secret;
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac("sha256", getSecret())
    .update(email.toLowerCase().trim())
    .digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token) return false;
  try {
    const expected = generateUnsubscribeToken(email);
    if (expected.length !== token.length) return false;
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(token, "utf8"));
  } catch {
    return false;
  }
}
