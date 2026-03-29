import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAuthSession,
  getSessionCookieName,
  getSessionCookieOptions,
  signInWithPassword
} from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `signin:${ip}:${email}`,
      windowMs: 1000 * 60 * 15,
      max: 8
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
    }

    const profile = await signInWithPassword({
      email,
      password: body.password ?? ""
    });
    const session = await createAuthSession(profile.id);
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), session.token, getSessionCookieOptions(session.expiresAt));
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed.";
    return NextResponse.json(
      {
        error: message,
        needsEmailVerification: message === "Please verify your email before signing in."
      },
      { status: 400 }
    );
  }
}
