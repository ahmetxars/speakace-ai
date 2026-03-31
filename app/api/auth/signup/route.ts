import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createEmailVerificationFlow,
  getSessionCookieName,
  getSessionCookieOptions,
  signUpWithPassword
} from "@/lib/server/auth";
import { sendWelcomePracticeEmail } from "@/lib/server/email";
import { isAdminEmail } from "@/lib/admin";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `signup:${ip}`,
      windowMs: 1000 * 60 * 30,
      max: 5
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many sign-up attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const profile = await signUpWithPassword({
      email: body.email ?? "",
      password: body.password ?? "",
      name: body.name ?? ""
    });
    const autoVerified = isAdminEmail(profile.email);
    const verification = await createEmailVerificationFlow(profile.email);
    try {
      await sendWelcomePracticeEmail({ to: profile.email, name: profile.name });
    } catch {
      // non-blocking
    }
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), "", getSessionCookieOptions(new Date(0)));
    return NextResponse.json({
      profile,
      verificationRequired: !autoVerified,
      emailSent: "emailSent" in verification ? verification.emailSent : false,
      verificationUrl: "verificationUrl" in verification ? verification.verificationUrl : undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign up failed." },
      { status: 400 }
    );
  }
}
