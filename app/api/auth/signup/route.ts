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
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { trackAnalyticsEvent } from "@/lib/analytics-store";
import { ANALYTICS_VISITOR_COOKIE, normalizeAnalyticsVisitorId } from "@/lib/analytics-policy";
import { isAdminEmail } from "@/lib/admin";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";
import { getPrivacySafeAnalyticsId } from "@/lib/server/analytics-identity";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const posthog = getPostHogClient();
  const analyticsId = getPrivacySafeAnalyticsId("signup", email);

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
        distinctId: analyticsId,
        event: "signup_failed",
        properties: { member_type: body.memberType ?? "student", reason: "rate_limited" }
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
          await getSql()`update users set teacher_access = true where id = ${profile.id}`;
          profile.teacherAccess = true;
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
    const cookieStore = await cookies();
    const visitorId = normalizeAnalyticsVisitorId(cookieStore.get(ANALYTICS_VISITOR_COOKIE)?.value);
    const rawPath = typeof body.attributionPath === "string"
      ? body.attributionPath.trim().slice(0, 500)
      : "";
    const safePath = rawPath ? (rawPath.startsWith("/") ? rawPath : `/${rawPath}`) : "/auth/signup";
    try {
      await trackAnalyticsEvent({
        userId: profile.id,
        visitorId,
        event: "signup_completed",
        eventId: `signup:${profile.id}`,
        path: safePath,
        source: "password_signup",
        plan: profile.plan,
        occurredAt: new Date().toISOString()
      });
    } catch {
      // Analytics must never block account creation.
    }
    posthog.identify({ distinctId: profile.id, properties: { member_type: profile.memberType } });
    posthog.capture({ distinctId: profile.id, event: "user_signed_up", properties: { member_type: profile.memberType, has_referral_code: Boolean(body.referralCode), has_class_code: Boolean(body.classCode) } });

    const verification = await createEmailVerificationFlow(profile.email);
    cookieStore.set(getSessionCookieName(), "", getSessionCookieOptions(new Date(0)));
    return NextResponse.json({
      profile,
      verificationRequired: !autoVerified,
      emailSent: "emailSent" in verification ? verification.emailSent : false,
      deliveryUnavailable:
        "deliveryUnavailable" in verification ? verification.deliveryUnavailable : false,
      ...(exposeAuthUrls && "verificationUrl" in verification ? { verificationUrl: verification.verificationUrl } : {}),
      classJoinMessage
    });
  } catch (error) {
    posthog.capture({
      distinctId: analyticsId,
      event: "signup_failed",
      properties: {
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
