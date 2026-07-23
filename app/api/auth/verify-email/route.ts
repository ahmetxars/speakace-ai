import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestIp, checkRateLimit } from "@/lib/server/rate-limit";
import {
  createAuthSession,
  getSessionCookieName,
  getSessionCookieOptions,
  verifyEmailToken
} from "@/lib/server/auth";
import {
  getCurrentEmailQuotaBlock,
  markOnboardingEmailSent,
  sendOnboardingEmail
} from "@/lib/server/email-sequences";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET(request: Request) {
  const ip = getRequestIp(request);
  const posthog = getPostHogClient();
  const limit = checkRateLimit({
    key: `verify-email:${ip}`,
    windowMs: 1000 * 60 * 15,
    max: 20
  });

  if (!limit.allowed) {
    posthog.capture({
      distinctId: `email-verification:${ip}`,
      event: "email_verification_failed",
      properties: { reason: "rate_limited" }
    });
    return NextResponse.json(
      { error: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const verification = await verifyEmailToken(token);
    const session = await createAuthSession(verification.userId);
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), session.token, getSessionCookieOptions(session.expiresAt));
    try {
      const quotaBlock = await getCurrentEmailQuotaBlock();
      if (!quotaBlock) {
        const result = await sendOnboardingEmail(verification.userId, 1);
        if (result.ok) {
          await markOnboardingEmailSent(verification.userId, 1);
        }
      }
    } catch {
      // Email delivery must never block account activation.
    }
    posthog.capture({
      distinctId: verification.userId,
      event: "email_verification_completed",
      properties: { token_present: Boolean(token), session_created: true }
    });
    return NextResponse.json({ ok: true, authenticated: true });
  } catch (error) {
    posthog.capture({
      distinctId: `email-verification:${ip}`,
      event: "email_verification_failed",
      properties: {
        reason: error instanceof Error ? error.message : "Verification failed."
      }
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 400 }
    );
  }
}
