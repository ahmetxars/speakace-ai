import { NextResponse } from "next/server";
import { createEmailVerificationFlow } from "@/lib/server/auth";
import { getPostHogClient } from "@/lib/posthog-server";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { getPrivacySafeAnalyticsId } from "@/lib/server/analytics-identity";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const posthog = getPostHogClient();
  const analyticsId = getPrivacySafeAnalyticsId("email-verification", email);

  try {
    const exposeAuthUrls = process.env.APP_ENV !== "production";
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `resend-verification:${ip}:${email}`,
      windowMs: 1000 * 60 * 30,
      max: 4
    });

    if (!limit.allowed) {
      posthog.capture({
        distinctId: analyticsId,
        event: "email_verification_request_failed",
        properties: { reason: "rate_limited" }
      });
      return NextResponse.json(
        { error: "Too many verification email requests. Please try again later." },
        { status: 429 }
      );
    }

    const result = await createEmailVerificationFlow(email);
    posthog.capture({
      distinctId: analyticsId,
      event: "email_verification_requested",
      properties: { email_sent: "emailSent" in result ? result.emailSent : false }
    });
    return NextResponse.json({
      ok: true,
      message: "If that account exists and is still unverified, a verification link is ready.",
      emailSent: "emailSent" in result ? result.emailSent : false,
      ...(exposeAuthUrls && "verificationUrl" in result ? { verificationUrl: result.verificationUrl } : {})
    });
  } catch (error) {
    posthog.capture({
      distinctId: analyticsId,
      event: "email_verification_request_failed",
      properties: { reason: error instanceof Error ? error.message : "Could not resend verification." }
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not resend verification." },
      { status: 400 }
    );
  }
}
