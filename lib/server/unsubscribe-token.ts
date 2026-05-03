import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("UNSUBSCRIBE_SECRET env var is not set. Set it to a strong random value.");
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
