import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createEmailVerificationFlow,
  getSessionCookieName,
  getSessionCookieOptions,
  signUpWithPassword
} from "@/lib/server/auth";
import { joinTeacherClassByCode } from "@/lib/classroom-store";
import { addOrgMember, getOrganizationByJoinCode } from "@/lib/server/org-store";
import { hasDatabaseUrl } from "@/lib/server/db";
import { trackAnalyticsEvent } from "@/lib/analytics-store";
import { markOnboardingEmailSent, sendOnboardingEmail } from "@/lib/server/email-sequences";
import { isAdminEmail } from "@/lib/admin";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const posthog = getPostHogClient();

  try {
    const exposeAuthUrls = process.env.APP_ENV !== "production";
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `signup:${ip}`,
      windowMs: 1000 * 60 * 30,
      max: 5
    });
    if (!limit.allowed) {
      posthog.capture({
        distinctId: email || `anonymous-signup:${ip}`,
        event: "signup_failed",
        properties: { email, member_type: body.memberType ?? "student", reason: "rate_limited" }
      });
      return rateLimitResponse(limit.retryAfterSeconds, "Too many sign-up attempts. Please try again later.");
    }

    const profile = await signUpWithPassword({
      email: body.email ?? "",
      password: body.password ?? "",
      name: body.name ?? "",
      memberType: body.memberType ?? "student",
      organizationName: body.organizationName ?? null,
      referralCode: body.referralCode ?? null,
      inviteReferrerId: body.inviteReferrerId ?? null
    });
    let classJoinMessage: string | undefined;
    if (profile.memberType === "teacher" && typeof body.schoolInviteCode === "string" && body.schoolInviteCode.trim() && hasDatabaseUrl()) {
      try {
        const org = await getOrganizationByJoinCode(body.schoolInviteCode.trim());
        if (org) {
          await addOrgMember({ orgId: org.id, userId: profile.id, role: "teacher" });
          classJoinMessage = `Joined ${org.name} as a teacher.`;
        }
      } catch {
        // non-blocking — signup still succeeds even if org join fails
      }
    }
    if (profile.memberType === "student" && typeof body.classCode === "string" && body.classCode.trim()) {
      try {
        const joinResult = await joinTeacherClassByCode({
          studentId: profile.id,
          joinCode: body.classCode.trim()
        });
        classJoinMessage =
          joinResult.status === "pending"
            ? "Class request sent. Your teacher will approve you soon."
            : `Joined ${joinResult.classroom.name}.`;
      } catch (error) {
        classJoinMessage = error instanceof Error ? error.message : "Class code could not be applied.";
      }
    }
    const autoVerified = isAdminEmail(profile.email);
    if (typeof body.attributionPath === "string" && body.attributionPath.trim()) {
      const rawPath = body.attributionPath.trim().slice(0, 500);
      const safePath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
      await trackAnalyticsEvent({
        userId: profile.id,
        event: "signup_completed",
        path: safePath
      });
    }
    posthog.identify({ distinctId: profile.id, properties: { email: profile.email, name: profile.name, member_type: profile.memberType } });
    posthog.capture({ distinctId: profile.id, event: "user_signed_up", properties: { email: profile.email, member_type: profile.memberType, has_referral_code: Boolean(body.referralCode), has_class_code: Boolean(body.classCode) } });

    const verification = await createEmailVerificationFlow(profile.email);
    try {
      const result = await sendOnboardingEmail(profile.id, 1);
      if (result.ok) {
        await markOnboardingEmailSent(profile.id, 1);
      }
    } catch {
      // non-blocking
    }
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), "", getSessionCookieOptions(new Date(0)));
    return NextResponse.json({
      profile,
      verificationRequired: !autoVerified,
      emailSent: "emailSent" in verification ? verification.emailSent : false,
      ...(exposeAuthUrls && "verificationUrl" in verification ? { verificationUrl: verification.verificationUrl } : {}),
      classJoinMessage
    });
  } catch (error) {
    posthog.capture({
      distinctId: email || "anonymous-signup",
      event: "signup_failed",
      properties: {
        email,
        member_type: body.memberType ?? "student",
        has_referral_code: Boolean(body.referralCode),
        has_class_code: Boolean(body.classCode),
        reason: error instanceof Error ? error.message : "Sign up failed."
      }
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign up failed." },
      { status: 400 }
    );
  }
}
