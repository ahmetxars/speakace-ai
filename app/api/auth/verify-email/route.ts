import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestIp, checkSharedRateLimit, sharedRateLimitResponse } from "@/lib/server/rate-limit";
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

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const posthog = getPostHogClient();
  const limit = await checkSharedRateLimit({
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
    return sharedRateLimitResponse(limit, "Too many verification attempts. Please try again later.");
  }

  try {
    const body = await request.json().catch(() => null);
    if (typeof body?.token !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "A verification link and a new password are required." }, { status: 400 });
    }
    const verification = await verifyEmailToken(body.token, body.password);
    const session = await createAuthSession(verification.userId, verification.passwordHash);
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
      properties: { token_present: true, session_created: true }
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
