import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { isAdminEmail, withAdminPrivileges } from "@/lib/admin";
import { createMemberProfile } from "@/lib/membership";
import { buildInviteReferralCode, getInviteReferrer } from "@/lib/referrals";
import { recordAuthActivity, validateReferralCode } from "@/lib/server/admin-panel";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { hasEmailTransport, sendPasswordResetEmail, sendVerificationEmail } from "@/lib/server/email";
import { MemberProfile } from "@/lib/types";
import { getActiveBillingPlanForEmail, getMember, upsertMember } from "@/lib/store";

const SESSION_COOKIE = "speakace_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const VERIFY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

interface MemoryAuthStore {
  passwordHashes: Map<string, string>;
  sessions: Map<string, { userId: string; expiresAt: string }>;
  tokens: Map<string, { userId: string; type: "verify_email" | "reset_password"; expiresAt: string; usedAt?: string }>;
}

function getMemoryAuthStore(): MemoryAuthStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceAuth?: MemoryAuthStore };
  if (!globalStore.__speakAceAuth) {
    globalStore.__speakAceAuth = {
      passwordHashes: new Map(),
      sessions: new Map(),
      tokens: new Map()
    };
  }

  return globalStore.__speakAceAuth;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function buildTokenExpiryDate(ttlMs: number) {
  return new Date(Date.now() + ttlMs);
}

function buildAppUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}

function isStrongEnoughPassword(password: string) {
  const trimmed = password.trim();
  return trimmed.length >= 8 && /\d/.test(trimmed);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.APP_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires
  };
}

export async function getAuthenticatedUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
  memberType?: MemberProfile["memberType"];
  organizationName?: string | null;
  referralCode?: string | null;
  inviteReferrerId?: string | null;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail || !input.password.trim()) {
    throw new Error("Email and password are required.");
  }
  if (!isStrongEnoughPassword(input.password)) {
    throw new Error("Password must be at least 8 characters long and include at least 1 number.");
  }

  const requestedMemberType =
    input.memberType === "teacher" || input.memberType === "school" ? input.memberType : "student";
  const passwordHash = await hash(input.password, 12);
  const purchasedPlan = await getActiveBillingPlanForEmail(normalizedEmail);
  const referral = await validateReferralCode(input.referralCode);
  const inviteReferrer =
    referral || !input.inviteReferrerId ? null : await getInviteReferrer(input.inviteReferrerId);
  const inviteTrialDays = inviteReferrer ? 7 : 0;
  const trialEndsAt = referral
    ? new Date(Date.now() + referral.trialDays * 24 * 60 * 60 * 1000).toISOString()
    : inviteReferrer
      ? new Date(Date.now() + inviteTrialDays * 24 * 60 * 60 * 1000).toISOString()
      : null;
  const profile = withAdminPrivileges({
    ...createMemberProfile(normalizedEmail, input.name, {
      memberType: requestedMemberType,
      organizationName: input.organizationName?.trim() || null
    }),
    teacherAccess: requestedMemberType === "teacher" || requestedMemberType === "school",
    adminAccess: requestedMemberType === "school",
    plan: purchasedPlan ?? (referral || inviteReferrer ? "plus" : "free"),
    billingStatus: referral || inviteReferrer ? "on_trial" : purchasedPlan ? "active" : "free",
    trialEndsAt,
    referralCodeUsed: referral?.code ?? (inviteReferrer ? buildInviteReferralCode(inviteReferrer.id) : null)
  });
  const autoVerified = isAdminEmail(normalizedEmail);

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const existing = await sql<{ id: string }[]>`
      select id from users where email = ${normalizedEmail} limit 1
    `;
    if (existing[0]) {
      throw new Error("An account with this email already exists.");
    }

    const rows = await sql<MemberProfile[]>`
      insert into users (
        id, email, name, role, member_type, organization_name, plan, password_hash, email_verified,
        admin_access, teacher_access, billing_status, trial_ends_at, referral_code_used, created_at
      )
      values (
        ${profile.id}, ${profile.email}, ${profile.name}, ${profile.role}, ${profile.memberType}, ${profile.organizationName ?? null},
        ${profile.plan}, ${passwordHash}, ${autoVerified}, ${profile.adminAccess ?? false}, ${profile.teacherAccess ?? false},
        ${profile.billingStatus ?? "free"}, ${profile.trialEndsAt ?? null}, ${profile.referralCodeUsed ?? null}, ${profile.createdAt}
      )
      returning
        id, email, name, role, member_type as "memberType", organization_name as "organizationName", plan,
        billing_status as "billingStatus", trial_ends_at as "trialEndsAt", referral_code_used as "referralCodeUsed",
        email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
    `;

    return withAdminPrivileges(rows[0]);
  }

  await upsertMember({ ...profile, emailVerified: autoVerified });
  getMemoryAuthStore().passwordHashes.set(profile.id, passwordHash);
  return { ...profile, emailVerified: autoVerified };
}

export async function signInWithPassword(input: { email: string; password: string }) {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<
      Array<MemberProfile & { password_hash: string | null; emailVerified?: boolean }>
    >`
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
        password_hash, email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
      from users
      where email = ${normalizedEmail}
      limit 1
    `;
    const user = rows[0];
    if (!user?.password_hash) {
      throw new Error("Invalid email or password.");
    }

    const isValid = await compare(input.password, user.password_hash);
    if (!isValid) {
      throw new Error("Invalid email or password.");
    }
    if (!user.emailVerified && !isAdminEmail(normalizedEmail)) {
      throw new Error("Please verify your email before signing in.");
    }
    if (!user.emailVerified && isAdminEmail(normalizedEmail)) {
      await sql`update users set email_verified = true where id = ${user.id}`;
      user.emailVerified = true;
    }

    const profile = withAdminPrivileges({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      memberType: user.memberType,
      organizationName: user.organizationName,
      plan: user.plan,
      billingStatus: user.billingStatus,
      lemonCustomerId: user.lemonCustomerId,
      lemonSubscriptionId: user.lemonSubscriptionId,
      trialEndsAt: user.trialEndsAt,
      referralCodeUsed: user.referralCodeUsed,
      adminAccess: user.adminAccess,
      teacherAccess: user.teacherAccess,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    });
    await recordAuthActivity({ userId: profile.id, eventType: "signin", meta: { source: "password" } });
    return profile;
  }

  const profile = await findMemberByEmail(normalizedEmail);
  if (!profile) {
    throw new Error("Invalid email or password.");
  }

  const storedHash = getMemoryAuthStore().passwordHashes.get(profile.id);
  if (!storedHash) {
    throw new Error("Invalid email or password.");
  }

  const isValid = await compare(input.password, storedHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }
  if (!profile.emailVerified && !isAdminEmail(normalizedEmail)) {
    throw new Error("Please verify your email before signing in.");
  }
  if (!profile.emailVerified && isAdminEmail(normalizedEmail)) {
    await upsertMember({ ...profile, emailVerified: true });
    return withAdminPrivileges({ ...profile, emailVerified: true });
  }

  return withAdminPrivileges(profile);
}

export async function applyInviteReferralToUser(input: {
  userId: string;
  inviteReferrerId?: string | null;
  preserveExistingPlan?: boolean;
}) {
  if (!input.inviteReferrerId) {
    return false;
  }

  const referrer = await getInviteReferrer(input.inviteReferrerId);
  if (!referrer || referrer.id === input.userId) {
    return false;
  }

  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const referralCodeUsed = buildInviteReferralCode(referrer.id);

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ referralCodeUsed: string | null }>>`
      select referral_code_used as "referralCodeUsed"
      from users
      where id = ${input.userId}
      limit 1
    `;

    if (!rows[0] || rows[0].referralCodeUsed) {
      return false;
    }

    await sql`
      update users
      set
        referral_code_used = ${referralCodeUsed},
        plan = case
          when ${input.preserveExistingPlan ?? false} then plan
          else 'plus'
        end,
        billing_status = case
          when ${input.preserveExistingPlan ?? false} then billing_status
          else 'on_trial'
        end,
        trial_ends_at = case
          when ${input.preserveExistingPlan ?? false} then trial_ends_at
          else ${trialEndsAt}
        end
      where id = ${input.userId}
    `;

    return true;
  }

  const profile = await getMember(input.userId);
  if (!profile || profile.referralCodeUsed) {
    return false;
  }

  await upsertMember({
    ...profile,
    plan: input.preserveExistingPlan ? profile.plan : "plus",
    billingStatus: input.preserveExistingPlan ? profile.billingStatus : "on_trial",
    trialEndsAt: input.preserveExistingPlan ? profile.trialEndsAt : trialEndsAt,
    referralCodeUsed
  });

  return true;
}

export async function createAuthSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = buildExpiryDate();

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into auth_sessions (id, user_id, token_hash, expires_at)
      values (${crypto.randomUUID()}, ${userId}, ${tokenHash}, ${expiresAt.toISOString()})
    `;
  } else {
    getMemoryAuthStore().sessions.set(tokenHash, {
      userId,
      expiresAt: expiresAt.toISOString()
    });
  }

  return { token, expiresAt };
}

export async function getAuthenticatedUser(sessionToken: string | undefined) {
  if (!sessionToken) {
    return null;
  }

  const tokenHash = sha256(sessionToken);

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select
        u.id, u.email, u.name, u.role, u.member_type as "memberType", u.organization_name as "organizationName",
        case
          when u.billing_status = 'on_trial' and u.trial_ends_at is not null and u.trial_ends_at <= now() then 'free'
          else u.plan
        end as "plan",
        case
          when u.billing_status = 'on_trial' and u.trial_ends_at is not null and u.trial_ends_at <= now() then 'expired'
          else u.billing_status
        end as "billingStatus",
        u.lemon_customer_id as "lemonCustomerId", u.lemon_subscription_id as "lemonSubscriptionId",
        u.trial_ends_at as "trialEndsAt", u.referral_code_used as "referralCodeUsed",
        u.email_verified as "emailVerified", u.admin_access as "adminAccess", u.teacher_access as "teacherAccess", u.created_at as "createdAt"
      from auth_sessions s
      inner join users u on u.id = s.user_id
      where s.token_hash = ${tokenHash} and s.expires_at > now()
      limit 1
    `;

    return rows[0] ? withAdminPrivileges(rows[0]) : null;
  }

  const session = getMemoryAuthStore().sessions.get(tokenHash);
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    getMemoryAuthStore().sessions.delete(tokenHash);
    return null;
  }

  const profile = await getMember(session.userId);
  return profile ? withAdminPrivileges(profile) : null;
}

export async function signOutSession(sessionToken: string | undefined) {
  if (!sessionToken) {
    return;
  }

  const tokenHash = sha256(sessionToken);
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ user_id: string }>>`
      select user_id from auth_sessions where token_hash = ${tokenHash} limit 1
    `;
    await sql`delete from auth_sessions where token_hash = ${tokenHash}`;
    if (rows[0]?.user_id) {
      await recordAuthActivity({ userId: rows[0].user_id, eventType: "signout", meta: { source: "session" } });
    }
    return;
  }

  getMemoryAuthStore().sessions.delete(tokenHash);
}

async function findMemberByEmail(email: string) {
  const store = globalThis as typeof globalThis & {
    __speakAceStore?: {
      members: Map<string, MemberProfile>;
    };
  };

  const members = store.__speakAceStore?.members;
  if (!members) {
    return null;
  }

  for (const profile of members.values()) {
    if (profile.email.toLowerCase() === email) {
      return profile;
    }
  }

  return null;
}

async function createAuthToken(input: { userId: string; type: "verify_email" | "reset_password"; ttlMs: number }) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = buildTokenExpiryDate(input.ttlMs);

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into auth_tokens (id, user_id, token_hash, token_type, expires_at)
      values (${crypto.randomUUID()}, ${input.userId}, ${tokenHash}, ${input.type}, ${expiresAt.toISOString()})
    `;
  } else {
    getMemoryAuthStore().tokens.set(tokenHash, {
      userId: input.userId,
      type: input.type,
      expiresAt: expiresAt.toISOString()
    });
  }

  return { token, expiresAt };
}

async function consumeAuthToken(token: string, type: "verify_email" | "reset_password") {
  const tokenHash = sha256(token);

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ user_id: string }>>`
      update auth_tokens
      set used_at = now()
      where token_hash = ${tokenHash}
        and token_type = ${type}
        and used_at is null
        and expires_at > now()
      returning user_id
    `;
    return rows[0]?.user_id ?? null;
  }

  const entry = getMemoryAuthStore().tokens.get(tokenHash);
  if (!entry || entry.type !== type || entry.usedAt) {
    return null;
  }
  if (new Date(entry.expiresAt).getTime() <= Date.now()) {
    getMemoryAuthStore().tokens.delete(tokenHash);
    return null;
  }

  entry.usedAt = new Date().toISOString();
  getMemoryAuthStore().tokens.set(tokenHash, entry);
  return entry.userId;
}

async function getUnverifiedUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select id, email, name, role, plan, email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
      from users
      where email = ${normalizedEmail}
      limit 1
    `;
    const user = rows[0];
    if (!user || user.emailVerified) return null;
    return withAdminPrivileges(user);
  }

  const profile = await findMemberByEmail(normalizedEmail);
  if (!profile || profile.emailVerified) return null;
  return withAdminPrivileges(profile);
}

export async function createEmailVerificationFlow(email: string) {
  const user = await getUnverifiedUserByEmail(email);
  if (!user) {
    return { ok: true as const };
  }

  const { token } = await createAuthToken({
    userId: user.id,
    type: "verify_email",
    ttlMs: VERIFY_TOKEN_TTL_MS
  });

  const verificationUrl = buildAppUrl(`/auth?verify=${token}`);
  if (hasEmailTransport()) {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl
    });
  }

  return {
    ok: true as const,
    verificationUrl,
    emailSent: hasEmailTransport()
  };
}

export async function verifyEmailToken(token: string) {
  const userId = await consumeAuthToken(token, "verify_email");
  if (!userId) {
    throw new Error("Verification link is invalid or expired.");
  }

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`update users set email_verified = ${true} where id = ${userId}`;
  } else {
    const profile = await getMember(userId);
    if (profile) {
      await upsertMember({ ...profile, emailVerified: true });
    }
  }

  return { ok: true as const };
}

export async function createPasswordResetFlow(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: true as const };
  }

  let resolvedProfile: MemberProfile | null = null;
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select id, email, name, role, plan, email_verified as "emailVerified", admin_access as "adminAccess", teacher_access as "teacherAccess", created_at as "createdAt"
      from users
      where email = ${normalizedEmail}
      limit 1
    `;
    resolvedProfile = rows[0] ?? null;
  } else {
    resolvedProfile = await findMemberByEmail(normalizedEmail);
  }

  if (!resolvedProfile) {
    return { ok: true as const };
  }

  const { token } = await createAuthToken({
    userId: resolvedProfile.id,
    type: "reset_password",
    ttlMs: RESET_TOKEN_TTL_MS
  });

  const resetUrl = buildAppUrl(`/auth?reset=${token}`);
  if (hasEmailTransport()) {
    await sendPasswordResetEmail({
      to: resolvedProfile.email,
      name: resolvedProfile.name,
      resetUrl
    });
  }

  return {
    ok: true as const,
    resetUrl,
    emailSent: hasEmailTransport()
  };
}

export async function resetPasswordWithToken(input: { token: string; password: string }) {
  if (!isStrongEnoughPassword(input.password)) {
    throw new Error("Password must be at least 8 characters long and include at least 1 number.");
  }

  const userId = await consumeAuthToken(input.token, "reset_password");
  if (!userId) {
    throw new Error("Reset link is invalid or expired.");
  }

  const passwordHash = await hash(input.password, 12);

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      update users
      set password_hash = ${passwordHash}
      where id = ${userId}
    `;
    return { ok: true as const };
  }

  getMemoryAuthStore().passwordHashes.set(userId, passwordHash);
  return { ok: true as const };
}
