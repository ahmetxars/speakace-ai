import { NextResponse } from "next/server";
import { createEmailVerificationFlow } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `resend-verification:${ip}:${email}`,
      windowMs: 1000 * 60 * 30,
      max: 4
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many verification email requests. Please try again later." },
        { status: 429 }
      );
    }

    const result = await createEmailVerificationFlow(email);
    return NextResponse.json({
      ok: true,
      message: "If that account exists and is still unverified, a verification link is ready.",
      verificationUrl: "verificationUrl" in result ? result.verificationUrl : undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not resend verification." },
      { status: 400 }
    );
  }
}
