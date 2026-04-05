import { compare } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { isAdminEmail } from "@/lib/admin";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import {
  AdminAuthActivityRecord,
  AdminInstitutionRecord,
  AdminMemberRecord,
  AdminOverview,
  AdminPanelSession,
  BillingStatus,
  ReferralCodeRecord,
  SubscriptionPlan
} from "@/lib/types";

const ADMIN_SESSION_COOKIE = "speakace_admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildExpiryDate() {
  return new Date(Date.now() + ADMIN_SESSION_TTL_MS);
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.APP_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires
  };
}

export function getConfiguredAdminCredentials() {
  const username = process.env.ADMIN_PANEL_USERNAME?.trim();
  const password = process.env.ADMIN_PANEL_PASSWORD?.trim();
  return username && password ? { username, password } : null;
}

export async function createAdminPanelSession(input: {
  adminUserId?: string | null;
  adminLabel: string;
  authMode: "config" | "member";
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = buildExpiryDate();

  if (!hasDatabaseUrl()) {
    return { token, expiresAt };
  }

  const sql = getSql();
  await sql`
    insert into admin_panel_sessions (id, admin_user_id, admin_label, auth_mode, token_hash, expires_at, created_at)
    values (
      ${crypto.randomUUID()},
      ${input.adminUserId ?? null},
      ${input.adminLabel},
      ${input.authMode},
      ${tokenHash},
      ${expiresAt.toISOString()},
      ${new Date().toISOString()}
    )
  `;

  return { token, expiresAt };
}

export async function getAdminPanelSession(sessionToken: string | undefined): Promise<AdminPanelSession | null> {
  if (!sessionToken || !hasDatabaseUrl()) {
    return null;
  }

  const sql = getSql();
  const tokenHash = sha256(sessionToken);
  const rows = await sql<AdminPanelSession[]>`
    select
      admin_user_id as "adminUserId",
      admin_label as "adminLabel",
      auth_mode as "authMode",
      expires_at as "expiresAt"
    from admin_panel_sessions
    where token_hash = ${tokenHash}
      and expires_at > now()
    limit 1
  `;

  return rows[0] ?? null;
}

export async function clearAdminPanelSession(sessionToken: string | undefined) {
  if (!sessionToken || !hasDatabaseUrl()) {
    return;
  }

  const sql = getSql();
  const tokenHash = sha256(sessionToken);
  await sql`delete from admin_panel_sessions where token_hash = ${tokenHash}`;
}

export async function authenticateAdminPanel(input: { identifier: string; password: string }) {
  const identifier = input.identifier.trim();
  const password = input.password.trim();
  if (!identifier || !password) {
    throw new Error("Username/email and password are required.");
  }

  const configured = getConfiguredAdminCredentials();
  if (configured && identifier === configured.username && password === configured.password) {
    return {
      adminUserId: null,
      adminLabel: configured.username,
      authMode: "config" as const
    };
  }

  if (!hasDatabaseUrl()) {
    throw new Error("Admin login requires DATABASE_URL.");
  }

  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      email: string;
      name: string;
      password_hash: string | null;
      admin_access: boolean;
    }>
  >`
    select id, email, name, password_hash, admin_access
    from users
    where lower(email) = ${identifier.toLowerCase()}
    limit 1
  `;
  const user = rows[0];
  if (!user?.password_hash) {
    throw new Error("Invalid admin credentials.");
  }

  const matches = await compare(password, user.password_hash);
  if (!matches) {
    throw new Error("Invalid admin credentials.");
  }

  if (!user.admin_access && !isAdminEmail(user.email)) {
    throw new Error("This account does not have admin access.");
  }

  return {
    adminUserId: user.id,
    adminLabel: user.name || user.email,
    authMode: "member" as const
  };
}

export async function recordAuthActivity(input: {
  userId: string;
  eventType: "signin" | "signout";
  meta?: Record<string, unknown>;
}) {
  if (!hasDatabaseUrl()) {
    return;
  }

  const sql = getSql();
  await sql`
    insert into auth_activity (id, user_id, event_type, meta_json, occurred_at)
    values (
      ${crypto.randomUUID()},
      ${input.userId},
      ${input.eventType},
      ${JSON.stringify(input.meta ?? {})},
      ${new Date().toISOString()}
    )
  `;
}

export async function validateReferralCode(code: string | null | undefined) {
  const normalized = code?.trim().toUpperCase();
  if (!normalized || !hasDatabaseUrl()) {
    return null;
  }

  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      code: string;
      trial_days: number;
      active: boolean;
      usage_limit: number | null;
      usage_count: number;
    }>
  >`
    select
      rc.id,
      rc.code,
      rc.trial_days,
      rc.active,
      rc.usage_limit,
      (
        select count(*)
        from users u
        where u.referral_code_used = rc.code
      )::int as usage_count
    from referral_codes rc
    where upper(rc.code) = ${normalized}
    limit 1
  `;

  const row = rows[0];
  if (!row || !row.active) {
    throw new Error("Referral code is invalid or inactive.");
  }
  if (row.usage_limit !== null && row.usage_count >= row.usage_limit) {
    throw new Error("Referral code usage limit has been reached.");
  }

  return {
    code: row.code,
    trialDays: row.trial_days
  };
}

function planWeeklyValue(plan: SubscriptionPlan, memberType?: string, institutionPrice?: number | null) {
  if (memberType === "school" && institutionPrice) {
    return Number(institutionPrice);
  }
  if (plan === "plus") return 3.99;
  if (plan === "pro") return 19.99;
  return 0;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!hasDatabaseUrl()) {
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalSchools: 0,
      paidMembers: 0,
      trialMembers: 0,
      activeSessions: 0,
      recentSignIns24h: 0,
      classesCount: 0,
      monthlyRevenueEstimate: 0,
      liveUsers5m: 0,
      requests5m: 0,
      pageViews1h: 0,
      lastRequestAt: null
    };
  }

  const sql = getSql();
  const [row] = await sql<
    Array<{
      total_users: number;
      total_students: number;
      total_teachers: number;
      total_schools: number;
      paid_members: number;
      trial_members: number;
      active_sessions: number;
      recent_signins_24h: number;
      classes_count: number;
      monthly_revenue_estimate: number;
      live_users_5m: number;
      requests_5m: number;
      page_views_1h: number;
      last_request_at: string | null;
    }>
  >`
    with institution_prices as (
      select teacher_id, monthly_price
      from institution_billing
    ),
    recent_analytics as (
      select user_id, event, created_at
      from analytics_events
    )
    select
      count(*)::int as total_users,
      count(*) filter (where member_type = 'student')::int as total_students,
      count(*) filter (where member_type = 'teacher')::int as total_teachers,
      count(*) filter (where member_type = 'school')::int as total_schools,
      count(*) filter (where billing_status in ('active', 'on_trial'))::int as paid_members,
      count(*) filter (where billing_status = 'on_trial')::int as trial_members,
      (select count(*)::int from auth_sessions where expires_at > now()) as active_sessions,
      (
        select count(*)::int
        from auth_activity
        where event_type = 'signin' and occurred_at > now() - interval '24 hours'
      ) as recent_signins_24h,
      (select count(*)::int from teacher_classes) as classes_count,
      (
        select count(distinct user_id)::int
        from recent_analytics
        where created_at > now() - interval '5 minutes'
      ) as live_users_5m,
      (
        select count(*)::int
        from recent_analytics
        where created_at > now() - interval '5 minutes'
      ) as requests_5m,
      (
        select count(*)::int
        from recent_analytics
        where event = 'page_view' and created_at > now() - interval '1 hour'
      ) as page_views_1h,
      (
        select max(created_at)::text
        from recent_analytics
      ) as last_request_at,
      coalesce(sum(
        case
          when users.member_type = 'school' then coalesce(institution_prices.monthly_price, 0)
          when users.plan = 'plus' and users.billing_status in ('active', 'on_trial') then 3.99
          when users.plan = 'pro' and users.billing_status in ('active', 'on_trial') then 19.99
          else 0
        end
      ), 0)::numeric(10,2) as monthly_revenue_estimate
    from users
    left join institution_prices on institution_prices.teacher_id = users.id
  `;

  return {
    totalUsers: row?.total_users ?? 0,
    totalStudents: row?.total_students ?? 0,
    totalTeachers: row?.total_teachers ?? 0,
    totalSchools: row?.total_schools ?? 0,
    paidMembers: row?.paid_members ?? 0,
    trialMembers: row?.trial_members ?? 0,
    activeSessions: row?.active_sessions ?? 0,
    recentSignIns24h: row?.recent_signins_24h ?? 0,
    classesCount: row?.classes_count ?? 0,
    monthlyRevenueEstimate: Number(row?.monthly_revenue_estimate ?? 0),
    liveUsers5m: row?.live_users_5m ?? 0,
    requests5m: row?.requests_5m ?? 0,
    pageViews1h: row?.page_views_1h ?? 0,
    lastRequestAt: row?.last_request_at ?? null
  };
}

export async function listAdminMembers(): Promise<AdminMemberRecord[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      name: string;
      email: string;
      role: "guest" | "member";
      member_type: "student" | "teacher" | "school";
      organization_name: string | null;
      plan: SubscriptionPlan;
      billing_status: BillingStatus;
      trial_ends_at: string | null;
      referral_code_used: string | null;
      email_verified: boolean;
      password_hash: string | null;
      created_at: string;
      institution_price: number | null;
      active_session_count: number;
      last_signin_at: string | null;
      last_signout_at: string | null;
      total_practice_sessions: number;
      average_score: number | null;
      teacher_note_count: number;
    }>
  >`
    select
      u.id,
      u.name,
      u.email,
      u.role,
      u.member_type,
      u.organization_name,
      u.plan,
      u.billing_status,
      u.trial_ends_at,
      u.referral_code_used,
      u.email_verified,
      u.password_hash,
      u.created_at,
      ib.monthly_price as institution_price,
      (
        select count(*)::int
        from auth_sessions s
        where s.user_id = u.id and s.expires_at > now()
      ) as active_session_count,
      (
        select max(a.occurred_at)::text
        from auth_activity a
        where a.user_id = u.id and a.event_type = 'signin'
      ) as last_signin_at,
      (
        select max(a.occurred_at)::text
        from auth_activity a
        where a.user_id = u.id and a.event_type = 'signout'
      ) as last_signout_at,
      (
        select count(*)::int
        from speaking_sessions ss
        where ss.user_id = u.id
      ) as total_practice_sessions,
      (
        select round(avg(fr.overall_score), 1)
        from speaking_sessions ss
        inner join feedback_reports fr on fr.session_id = ss.id
        where ss.user_id = u.id
      ) as average_score,
      (
        select count(*)::int
        from teacher_notes tn
        where tn.student_id = u.id
      ) as teacher_note_count
    from users u
    left join institution_billing ib on ib.teacher_id = u.id
    order by u.created_at desc
  `;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    memberType: row.member_type,
    organizationName: row.organization_name,
    plan: row.plan,
    billingStatus: row.billing_status,
    trialEndsAt: row.trial_ends_at,
    referralCodeUsed: row.referral_code_used,
    emailVerified: row.email_verified,
    passwordStatus: row.password_hash ? "protected" : "no_password",
    createdAt: row.created_at,
    monthlyValue: planWeeklyValue(row.plan, row.member_type, row.institution_price),
    activeSessionCount: row.active_session_count,
    lastSignInAt: row.last_signin_at,
    lastSignOutAt: row.last_signout_at,
    totalPracticeSessions: row.total_practice_sessions,
    averageScore: row.average_score,
    teacherNoteCount: row.teacher_note_count
  }));
}

export async function listAdminBillingEvents(limit = 20) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      event_name: string;
      user_email: string | null;
      plan: SubscriptionPlan;
      billing_status: BillingStatus;
      created_at: string;
    }>
  >`
    select id, event_name, user_email, plan, billing_status, created_at
    from billing_events
    order by created_at desc
    limit ${limit}
  `;

  return rows.map((row) => ({
    id: String(row.id),
    event_name: String(row.event_name),
    user_email: row.user_email ? String(row.user_email) : null,
    plan: row.plan,
    billing_status: row.billing_status,
    created_at: String(row.created_at)
  }));
}

export async function listAdminAuthActivity(limit = 30): Promise<AdminAuthActivityRecord[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      user_id: string | null;
      user_name: string | null;
      user_email: string | null;
      member_type: "student" | "teacher" | "school" | null;
      event_type: "signin" | "signout";
      occurred_at: string;
    }>
  >`
    select
      a.id,
      a.user_id,
      u.name as user_name,
      u.email as user_email,
      u.member_type,
      a.event_type,
      a.occurred_at
    from auth_activity a
    left join users u on u.id = a.user_id
    order by a.occurred_at desc
    limit ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name ?? "Unknown user",
    userEmail: row.user_email ?? "Unknown email",
    memberType: row.member_type,
    eventType: row.event_type,
    occurredAt: row.occurred_at
  }));
}

export async function listReferralCodes(): Promise<ReferralCodeRecord[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<
    Array<{
      id: string;
      code: string;
      label: string | null;
      trial_days: number;
      active: boolean;
      usage_limit: number | null;
      usage_count: number;
      created_at: string;
    }>
  >`
    select
      rc.id,
      rc.code,
      rc.label,
      rc.trial_days,
      rc.active,
      rc.usage_limit,
      (
        select count(*)
        from users u
        where u.referral_code_used = rc.code
      )::int as usage_count,
      rc.created_at
    from referral_codes rc
    order by rc.created_at desc
  `;

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    label: row.label,
    trialDays: row.trial_days,
    active: row.active,
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    createdAt: row.created_at
  }));
}

export async function updateAdminMemberAccess(input: {
  memberId: string;
  plan: SubscriptionPlan;
  billingStatus: BillingStatus;
  trialDays?: number | null;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Admin member updates require DATABASE_URL.");
  }

  const memberId = input.memberId.trim();
  if (!memberId) {
    throw new Error("Member id is required.");
  }

  const allowedPlans: SubscriptionPlan[] = ["free", "plus", "pro"];
  const allowedStatuses: BillingStatus[] = ["free", "active", "on_trial", "paused", "cancelled", "past_due", "expired", "refunded"];

  if (!allowedPlans.includes(input.plan)) {
    throw new Error("Invalid plan.");
  }

  if (!allowedStatuses.includes(input.billingStatus)) {
    throw new Error("Invalid billing status.");
  }

  const trialEndsAt =
    input.billingStatus === "on_trial"
      ? new Date(Date.now() + Math.max(1, Math.min(30, input.trialDays ?? 7)) * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const plan = input.billingStatus === "free" ? "free" : input.plan;
  const sql = getSql();
  await sql`
    update users
    set
      plan = ${plan},
      billing_status = ${input.billingStatus},
      trial_ends_at = ${trialEndsAt}
    where id = ${memberId}
  `;
}

export async function createReferralCode(input: {
  code: string;
  label?: string;
  trialDays?: number;
  usageLimit?: number | null;
  createdBy?: string;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Referral codes require DATABASE_URL.");
  }

  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{4,32}$/.test(code)) {
    throw new Error("Referral code must be 4-32 characters and use only letters, numbers, dash, or underscore.");
  }

  const sql = getSql();
  await sql`
    insert into referral_codes (id, code, label, created_by, trial_days, active, usage_limit, created_at)
    values (
      ${crypto.randomUUID()},
      ${code},
      ${input.label?.trim() || null},
      ${input.createdBy ?? null},
      ${Math.max(1, Math.min(30, input.trialDays ?? 7))},
      ${true},
      ${input.usageLimit ?? null},
      ${new Date().toISOString()}
    )
  `;
}

export async function listInstitutionBreakdown(): Promise<AdminInstitutionRecord[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<AdminInstitutionRecord[]>`
    select
      coalesce(nullif(trim(u.organization_name), ''), 'Independent') as "organizationName",
      count(*) filter (where u.member_type = 'teacher')::int as teachers,
      count(*) filter (where u.member_type = 'student')::int as students,
      count(*) filter (where u.member_type = 'school')::int as schools,
      (
        select round(avg(fr.overall_score), 1)
        from speaking_sessions ss
        inner join feedback_reports fr on fr.session_id = ss.id
        inner join users su on su.id = ss.user_id
        where coalesce(nullif(trim(su.organization_name), ''), 'Independent') = coalesce(nullif(trim(u.organization_name), ''), 'Independent')
      ) as "averageScore",
      (
        select count(*)::int
        from speaking_sessions ss
        inner join users su on su.id = ss.user_id
        where coalesce(nullif(trim(su.organization_name), ''), 'Independent') = coalesce(nullif(trim(u.organization_name), ''), 'Independent')
      ) as "totalSessions"
    from users u
    group by coalesce(nullif(trim(u.organization_name), ''), 'Independent')
    order by students desc, teachers desc, "organizationName" asc
  `;

  return rows.map((row) => ({
    organizationName: String(row.organizationName),
    teachers: Number(row.teachers ?? 0),
    students: Number(row.students ?? 0),
    schools: Number(row.schools ?? 0),
    averageScore: row.averageScore === null || row.averageScore === undefined ? null : Number(row.averageScore),
    totalSessions: Number(row.totalSessions ?? 0)
  }));
}
