import { NextResponse } from "next/server";
import { getRequestIp, checkRateLimit } from "@/lib/server/rate-limit";
import { verifyEmailToken } from "@/lib/server/auth";
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
    await verifyEmailToken(token);
    posthog.capture({
      distinctId: `email-verification:${ip}`,
      event: "email_verification_completed",
      properties: { token_present: Boolean(token) }
    });
    return NextResponse.json({ ok: true });
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
