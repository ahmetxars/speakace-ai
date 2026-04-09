import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminEmail, withAdminPrivileges } from "@/lib/admin";
import { createMemberProfile } from "@/lib/membership";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { createAuthSession, getSessionCookieName, getSessionCookieOptions } from "@/lib/server/auth";
import { upsertMember } from "@/lib/store";
import { MemberProfile } from "@/lib/types";

/**
 * Google OAuth callback route.
 * Required env vars:
 *   GOOGLE_CLIENT_ID       — OAuth 2.0 client ID
 *   GOOGLE_CLIENT_SECRET   — OAuth 2.0 client secret
 *   GOOGLE_REDIRECT_URI    — Must match the one used in /api/auth/google
 */

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    }).toString()
  });

  return response.json() as Promise<GoogleTokenResponse>;
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.json() as Promise<GoogleUserInfo>;
}

async function findOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<MemberProfile> {
  const normalizedEmail = googleUser.email.trim().toLowerCase();
  const displayName = googleUser.name ?? googleUser.given_name ?? normalizedEmail.split("@")[0];

  if (hasDatabaseUrl()) {
    const sql = getSql();

    // Try to find existing user
    const existing = await sql<MemberProfile[]>`
      select
        id, email, name, role, member_type as "memberType", organization_name as "organizationName",
        case
          when billing_status = 'on_trial' and trial_ends_at is not null and trial_ends_at <= now() then 'free'
          else plan
        end as "plan",
        case
          when billing_status = 'on_trial' and trial_ends_at is not null and trial_ends_at <= now() then 'expired'
          else billing_status
        end as "billingStatus",
        lemon_customer_id as "lemonCustomerId", lemon_subscription_id as "lemonSubscriptionId",
        trial_ends_at as "trialEndsAt", referral_code_used as "referralCodeUsed",
        email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
      from users
      where email = ${normalizedEmail}
      limit 1
    `;

    if (existing[0]) {
      // User exists — ensure email is verified (Google already verified it)
      if (!existing[0].emailVerified) {
        await sql`update users set email_verified = true where email = ${normalizedEmail}`;
        existing[0].emailVerified = true;
      }
      return withAdminPrivileges(existing[0]);
    }

    // Create new user — Google already verified the email
    const profile = withAdminPrivileges({
      ...createMemberProfile(normalizedEmail, displayName),
      emailVerified: true
    });
    const autoAdmin = isAdminEmail(normalizedEmail);

    const rows = await sql<MemberProfile[]>`
      insert into users (
        id, email, name, role, member_type, organization_name, plan, password_hash, email_verified,
        admin_access, teacher_access, billing_status, created_at
      )
      values (
        ${profile.id}, ${normalizedEmail}, ${profile.name}, ${profile.role}, ${profile.memberType},
        ${profile.organizationName ?? null}, ${profile.plan}, null, true,
        ${autoAdmin}, false, 'free', ${profile.createdAt}
      )
      returning
        id, email, name, role, member_type as "memberType", organization_name as "organizationName", plan,
        billing_status as "billingStatus", trial_ends_at as "trialEndsAt", referral_code_used as "referralCodeUsed",
        email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
    `;

    return withAdminPrivileges(rows[0]);
  }

  // Memory store fallback
  const store = globalThis as typeof globalThis & {
    __speakAceStore?: { members: Map<string, MemberProfile> };
  };

  const members = store.__speakAceStore?.members;
  if (members) {
    for (const profile of members.values()) {
      if (profile.email.toLowerCase() === normalizedEmail) {
        if (!profile.emailVerified) {
          await upsertMember({ ...profile, emailVerified: true });
          return withAdminPrivileges({ ...profile, emailVerified: true });
        }
        return withAdminPrivileges(profile);
      }
    }
  }

  // Create new user in memory store
  const newProfile = withAdminPrivileges({
    ...createMemberProfile(normalizedEmail, displayName),
    emailVerified: true
  });
  await upsertMember(newProfile);
  return newProfile;
}

export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${siteUrl}/auth?error=google_not_configured`);
  }

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${siteUrl}/auth?error=google_denied`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (tokens.error || !tokens.access_token) {
      return NextResponse.redirect(`${siteUrl}/auth?error=google_token_failed`);
    }

    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      return NextResponse.redirect(`${siteUrl}/auth?error=google_no_email`);
    }

    const profile = await findOrCreateGoogleUser(googleUser);
    const session = await createAuthSession(profile.id);

    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), session.token, getSessionCookieOptions(session.expiresAt));

    return NextResponse.redirect(`${siteUrl}/app`);
  } catch (err) {
    console.error("[Google OAuth callback error]", err);
    return NextResponse.redirect(`${siteUrl}/auth?error=google_failed`);
  }
}
