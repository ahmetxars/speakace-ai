import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { resetPasswordWithToken } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `reset-password:${ip}`,
      windowMs: 1000 * 60 * 15,
      max: 8
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    await resetPasswordWithToken({
      token,
      password: String(body.password ?? "")
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset password." },
      { status: 400 }
    );
  }
}
