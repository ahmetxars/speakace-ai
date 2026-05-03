import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAuthSession,
  getSessionCookieName,
  getSessionCookieOptions,
  signInWithPassword
} from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const posthog = getPostHogClient();

  try {
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `signin:${ip}:${email}`,
      windowMs: 1000 * 60 * 15,
      max: 8
    });
    if (!limit.allowed) {
      posthog.capture({
        distinctId: email || `anonymous-signin:${ip}`,
        event: "signin_failed",
        properties: { email, reason: "rate_limited" }
      });
      return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
    }

    const profile = await signInWithPassword({
      email,
      password: body.password ?? ""
    });
    const session = await createAuthSession(profile.id);
    posthog.identify({ distinctId: profile.id, properties: { email: profile.email, name: profile.name } });
    posthog.capture({ distinctId: profile.id, event: "user_signed_in", properties: { email: profile.email } });
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), session.token, getSessionCookieOptions(session.expiresAt));
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed.";
    posthog.capture({
      distinctId: email || "anonymous-signin",
      event: "signin_failed",
      properties: { email, reason: message }
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
