import { NextResponse } from "next/server";
import { createPasswordResetFlow } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const exposeAuthUrls = process.env.APP_ENV !== "production";
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `request-password-reset:${ip}:${email}`,
      windowMs: 1000 * 60 * 30,
      max: 4
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please try again later." },
        { status: 429 }
      );
    }

    const result = await createPasswordResetFlow(email);
    return NextResponse.json({
      ok: true,
      message: "If that account exists, a password reset link is ready.",
      emailSent: "emailSent" in result ? result.emailSent : false,
      ...(exposeAuthUrls && "resetUrl" in result ? { resetUrl: result.resetUrl } : {})
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create password reset link." },
      { status: 400 }
    );
  }
}
