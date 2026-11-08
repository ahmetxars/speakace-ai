import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getSessionCookieName,
  getSessionCookieOptions,
  signInWithPassword
} from "@/lib/server/auth";
import { checkSharedRateLimit, getRequestIp, sharedRateLimitResponse } from "@/lib/server/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";
import { getPrivacySafeAnalyticsId } from "@/lib/server/analytics-identity";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const posthog = getPostHogClient();
  const analyticsId = getPrivacySafeAnalyticsId("signin", email);

  try {
    const ip = getRequestIp(request);
    const limit = await checkSharedRateLimit(
      { key: `signin:${ip}`, windowMs: 1000 * 60 * 15, max: 20 },
      { key: `signin:email:${email}`, windowMs: 1000 * 60 * 15, max: 8 }
    );
    if (!limit.allowed) {
      posthog.capture({
        distinctId: analyticsId,
        event: "signin_failed",
        properties: { reason: "rate_limited" }
      });
      return sharedRateLimitResponse(limit, "Too many sign-in attempts. Please try again later.");
    }

    const { profile, session } = await signInWithPassword({
      email,
      password: body.password ?? ""
    });
    posthog.identify({ distinctId: profile.id });
    posthog.capture({ distinctId: profile.id, event: "user_signed_in" });
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), session.token, getSessionCookieOptions(session.expiresAt));
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed.";
    posthog.capture({
      distinctId: analyticsId,
      event: "signin_failed",
      properties: { reason: message }
    });
    return NextResponse.json(
      {
        error: message,
        needsEmailVerification: message === "Please verify your email before signing in."
      },
      { status: 400 }
    );
  }
}
