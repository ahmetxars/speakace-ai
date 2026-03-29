import { NextResponse } from "next/server";
import { getRequestIp, checkRateLimit } from "@/lib/server/rate-limit";
import { verifyEmailToken } from "@/lib/server/auth";

export async function GET(request: Request) {
  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `verify-email:${ip}`,
    windowMs: 1000 * 60 * 15,
    max: 20
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    await verifyEmailToken(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 400 }
    );
  }
}
