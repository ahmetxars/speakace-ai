import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { resetPasswordWithToken } from "@/lib/server/auth";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const posthog = getPostHogClient();

  try {
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `reset-password:${ip}`,
      windowMs: 1000 * 60 * 15,
      max: 8
    });

    if (!limit.allowed) {
      posthog.capture({
        distinctId: `password-reset:${ip}`,
        event: "password_reset_failed",
        properties: { reason: "rate_limited", token_present: Boolean(token) }
      });
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    await resetPasswordWithToken({
      token,
      password: String(body.password ?? "")
    });
    posthog.capture({
      distinctId: `password-reset:${ip}`,
      event: "password_reset_completed",
      properties: { token_present: Boolean(token) }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const ip = getRequestIp(request);
    posthog.capture({
      distinctId: `password-reset:${ip}`,
      event: "password_reset_failed",
      properties: {
        reason: error instanceof Error ? error.message : "Could not reset password.",
        token_present: Boolean(token)
      }
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset password." },
      { status: 400 }
    );
  }
}
