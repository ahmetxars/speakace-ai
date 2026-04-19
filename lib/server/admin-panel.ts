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
      lastRequestAt: null,
      ctaClicks7d: 0,
      ctaClicks30d: 0,
      checkoutClicks7d: 0,
      checkoutClicks30d: 0,
      interviewStarts7d: 0,
      interviewStarts30d: 0,
      interviewFollowUps7d: 0,
      interviewFollowUps30d: 0,
        pdfExports7d: 0,
        pdfExports30d: 0,
        resultCardDownloads7d: 0,
        resultCardDownloads30d: 0,
        resultShares7d: 0,
        resultShares30d: 0,
        resultShareX7d: 0,
        resultShareX30d: 0,
        resultShareWhatsApp7d: 0,
        resultShareWhatsApp30d: 0,
        resultShareLinkedIn7d: 0,
        resultShareLinkedIn30d: 0,
        writingStarts7d: 0,
      writingStarts30d: 0,
      writingEvaluations7d: 0,
      writingEvaluations30d: 0,
      writingRetries7d: 0,
      writingRetries30d: 0,
      writingPdfExports7d: 0,
      writingPdfExports30d: 0,
      topCtas: [],
      bestPerformingCtas: [],
      winnerCta7d: null,
      topCtaPages: [],
      ctaTrend14d: [],
      funnel7d: {
        ctaClicks: 0,
        signupCount: 0,
        checkoutClicks: 0,
        paidCount: 0,
        clickToSignupRate: 0,
        signupToCheckoutRate: 0,
        checkoutToPaidRate: 0,
        clickToPaidRate: 0
      },
      funnel30d: {
        ctaClicks: 0,
        signupCount: 0,
        checkoutClicks: 0,
        paidCount: 0,
        clickToSignupRate: 0,
        signupToCheckoutRate: 0,
        checkoutToPaidRate: 0,
        clickToPaidRate: 0
      }
    };
  }

  const sql = getSql();
  const paidEventNames = ["order_created", "subscription_created", "subscription_resumed", "subscription_unpaused"];
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
      cta_clicks_7d: number;
      cta_clicks_30d: number;
      checkout_clicks_7d: number;
      checkout_clicks_30d: number;
      interview_starts_7d: number;
      interview_starts_30d: number;
      interview_followups_7d: number;
      interview_followups_30d: number;
      pdf_exports_7d: number;
      pdf_exports_30d: number;
      result_card_downloads_7d: number;
      result_card_downloads_30d: number;
      result_shares_7d: number;
      result_shares_30d: number;
      result_share_x_7d: number;
      result_share_x_30d: number;
      result_share_whatsapp_7d: number;
      result_share_whatsapp_30d: number;
      result_share_linkedin_7d: number;
      result_share_linkedin_30d: number;
      writing_starts_7d: number;
      writing_starts_30d: number;
      writing_evaluations_7d: number;
      writing_evaluations_30d: number;
      writing_retries_7d: number;
      writing_retries_30d: number;
      writing_pdf_exports_7d: number;
      writing_pdf_exports_30d: number;
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
        select count(*)::int
        from recent_analytics
        where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
          and created_at > now() - interval '7 days'
      ) as cta_clicks_7d,
      (
        select count(*)::int
        from recent_analytics
        where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
          and created_at > now() - interval '30 days'
      ) as cta_clicks_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'checkout_cta_click'
          and created_at > now() - interval '7 days'
      ) as checkout_clicks_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'checkout_cta_click'
          and created_at > now() - interval '30 days'
      ) as checkout_clicks_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'interview_mode_start'
          and created_at > now() - interval '7 days'
      ) as interview_starts_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'interview_mode_start'
          and created_at > now() - interval '30 days'
      ) as interview_starts_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'interview_followup_continue'
          and created_at > now() - interval '7 days'
      ) as interview_followups_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'interview_followup_continue'
          and created_at > now() - interval '30 days'
      ) as interview_followups_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'pdf_report_export'
          and created_at > now() - interval '7 days'
      ) as pdf_exports_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'pdf_report_export'
          and created_at > now() - interval '30 days'
      ) as pdf_exports_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_card_download'
          and created_at > now() - interval '7 days'
      ) as result_card_downloads_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_card_download'
          and created_at > now() - interval '30 days'
      ) as result_card_downloads_30d,
      (
        select count(*)::int
        from recent_analytics
        where event in ('result_share_x', 'result_share_whatsapp', 'result_share_linkedin', 'result_share_native', 'result_share_copy')
          and created_at > now() - interval '7 days'
      ) as result_shares_7d,
      (
        select count(*)::int
        from recent_analytics
        where event in ('result_share_x', 'result_share_whatsapp', 'result_share_linkedin', 'result_share_native', 'result_share_copy')
          and created_at > now() - interval '30 days'
      ) as result_shares_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_share_x'
          and created_at > now() - interval '7 days'
      ) as result_share_x_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_share_x'
          and created_at > now() - interval '30 days'
      ) as result_share_x_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_share_whatsapp'
          and created_at > now() - interval '7 days'
      ) as result_share_whatsapp_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_share_whatsapp'
          and created_at > now() - interval '30 days'
      ) as result_share_whatsapp_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_share_linkedin'
          and created_at > now() - interval '7 days'
      ) as result_share_linkedin_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'result_share_linkedin'
          and created_at > now() - interval '30 days'
      ) as result_share_linkedin_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_start'
          and created_at > now() - interval '7 days'
      ) as writing_starts_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_start'
          and created_at > now() - interval '30 days'
      ) as writing_starts_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_evaluated'
          and created_at > now() - interval '7 days'
      ) as writing_evaluations_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_evaluated'
          and created_at > now() - interval '30 days'
      ) as writing_evaluations_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_retry'
          and created_at > now() - interval '7 days'
      ) as writing_retries_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_retry'
          and created_at > now() - interval '30 days'
      ) as writing_retries_30d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_pdf_export'
          and created_at > now() - interval '7 days'
      ) as writing_pdf_exports_7d,
      (
        select count(*)::int
        from recent_analytics
        where event = 'writing_pdf_export'
          and created_at > now() - interval '30 days'
      ) as writing_pdf_exports_30d,
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

  const topCtaRows = await sql<
    Array<{
      path: string | null;
      event: string;
      count: number;
    }>
  >`
    select
      path,
      event,
      count(*)::int as count
    from analytics_events
    where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
      and created_at > now() - interval '30 days'
    group by path, event
    order by count desc, path asc nulls last
    limit 8
  `;

  const topPageRows = await sql<
    Array<{
      page: string | null;
      clicks: number;
      checkout_clicks: number;
    }>
  >`
    with cta_events as (
      select
        case
          when path like '/pricing%' then '/pricing'
          when path like '/#%' then '/'
          when path like 'segment:%' then '/segments'
          when path like '/compare%' then '/compare'
          else coalesce(nullif(split_part(path, '?', 1), ''), '/')
        end as page,
        event
      from analytics_events
      where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
        and created_at > now() - interval '30 days'
    )
    select
      page,
      count(*)::int as clicks,
      count(*) filter (where event = 'checkout_cta_click')::int as checkout_clicks
    from cta_events
    group by page
    order by clicks desc, page asc nulls last
    limit 6
  `;

  const bestPerformingCtaRows = await sql<
    Array<{
      path: string | null;
      clicks: number;
      signups: number;
      paid_count: number;
    }>
  >`
    with click_paths as (
      select path, count(*)::int as clicks
      from analytics_events
      where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
        and path is not null
        and created_at > now() - interval '30 days'
      group by path
    ),
    signup_paths as (
      select path, count(*)::int as signups
      from analytics_events
      where event = 'signup_completed'
        and path is not null
        and created_at > now() - interval '30 days'
      group by path
    ),
    paid_paths as (
      select
        payload_json->'meta'->'custom_data'->>'cta_path' as path,
        count(distinct coalesce(provider_subscription_id, user_id, user_email, id))::int as paid_count
      from billing_events
      where billing_status in ('active', 'on_trial')
        and event_name = any(${paidEventNames})
        and created_at > now() - interval '30 days'
      group by 1
    )
    select
      click_paths.path,
      click_paths.clicks,
      coalesce(signup_paths.signups, 0)::int as signups,
      coalesce(paid_paths.paid_count, 0)::int as paid_count
    from click_paths
    left join signup_paths on signup_paths.path = click_paths.path
    left join paid_paths on paid_paths.path = click_paths.path
    order by paid_count desc, signups desc, clicks desc, click_paths.path asc
    limit 8
  `;

  const [winnerCtaRow] = await sql<
    Array<{
      path: string | null;
      clicks: number;
      signups: number;
      paid_count: number;
    }>
  >`
    with click_paths as (
      select path, count(*)::int as clicks
      from analytics_events
      where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
        and path is not null
        and created_at > now() - interval '7 days'
      group by path
    ),
    signup_paths as (
      select path, count(*)::int as signups
      from analytics_events
      where event = 'signup_completed'
        and path is not null
        and created_at > now() - interval '7 days'
      group by path
    ),
    paid_paths as (
      select
        payload_json->'meta'->'custom_data'->>'cta_path' as path,
        count(distinct coalesce(provider_subscription_id, user_id, user_email, id))::int as paid_count
      from billing_events
      where billing_status in ('active', 'on_trial')
        and event_name = any(${paidEventNames})
        and created_at > now() - interval '7 days'
      group by 1
    )
    select
      click_paths.path,
      click_paths.clicks,
      coalesce(signup_paths.signups, 0)::int as signups,
      coalesce(paid_paths.paid_count, 0)::int as paid_count
    from click_paths
    left join signup_paths on signup_paths.path = click_paths.path
    left join paid_paths on paid_paths.path = click_paths.path
    order by paid_count desc, signups desc, clicks desc, click_paths.path asc
    limit 1
  `;

  const trendRows = await sql<
    Array<{
      date: string;
      cta_clicks: number;
      signup_count: number;
      checkout_clicks: number;
      paid_count: number;
    }>
  >`
    with days as (
      select generate_series(
        date_trunc('day', now() - interval '13 days'),
        date_trunc('day', now()),
        interval '1 day'
      ) as day
    ),
    cta_daily as (
      select date_trunc('day', created_at) as day, count(*)::int as count
      from analytics_events
      where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
        and created_at >= now() - interval '14 days'
      group by 1
    ),
    checkout_daily as (
      select date_trunc('day', created_at) as day, count(*)::int as count
      from analytics_events
      where event = 'checkout_cta_click'
        and created_at >= now() - interval '14 days'
      group by 1
    ),
    signup_daily as (
      select date_trunc('day', created_at) as day, count(*)::int as count
      from users
      where created_at >= now() - interval '14 days'
      group by 1
    ),
    paid_daily as (
      select
        date_trunc('day', created_at) as day,
        count(distinct coalesce(provider_subscription_id, user_id, user_email, id))::int as count
      from billing_events
      where billing_status in ('active', 'on_trial')
        and event_name = any(${paidEventNames})
        and created_at >= now() - interval '14 days'
      group by 1
    )
    select
      to_char(days.day, 'YYYY-MM-DD') as date,
      coalesce(cta_daily.count, 0)::int as cta_clicks,
      coalesce(signup_daily.count, 0)::int as signup_count,
      coalesce(checkout_daily.count, 0)::int as checkout_clicks,
      coalesce(paid_daily.count, 0)::int as paid_count
    from days
    left join cta_daily on cta_daily.day = days.day
    left join signup_daily on signup_daily.day = days.day
    left join checkout_daily on checkout_daily.day = days.day
    left join paid_daily on paid_daily.day = days.day
    order by days.day asc
  `;

  const [funnelRow] = await sql<
    Array<{
      cta_clicks_7d: number;
      signup_count_7d: number;
      checkout_clicks_7d: number;
      paid_count_7d: number;
      cta_clicks_30d: number;
      signup_count_30d: number;
      checkout_clicks_30d: number;
      paid_count_30d: number;
    }>
  >`
    select
      (
        select count(*)::int
        from analytics_events
        where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
          and created_at > now() - interval '7 days'
      ) as cta_clicks_7d,
      (
        select count(*)::int
        from users
        where created_at > now() - interval '7 days'
      ) as signup_count_7d,
      (
        select count(*)::int
        from analytics_events
        where event = 'checkout_cta_click'
          and created_at > now() - interval '7 days'
      ) as checkout_clicks_7d,
      (
        select count(distinct coalesce(provider_subscription_id, user_id, user_email, id))::int
        from billing_events
        where billing_status in ('active', 'on_trial')
          and event_name = any(${paidEventNames})
          and created_at > now() - interval '7 days'
      ) as paid_count_7d,
      (
        select count(*)::int
        from analytics_events
        where event in ('marketing_cta_click', 'pricing_cta_click', 'checkout_cta_click')
          and created_at > now() - interval '30 days'
      ) as cta_clicks_30d,
      (
        select count(*)::int
        from users
        where created_at > now() - interval '30 days'
      ) as signup_count_30d,
      (
        select count(*)::int
        from analytics_events
        where event = 'checkout_cta_click'
          and created_at > now() - interval '30 days'
      ) as checkout_clicks_30d,
      (
        select count(distinct coalesce(provider_subscription_id, user_id, user_email, id))::int
        from billing_events
        where billing_status in ('active', 'on_trial')
          and event_name = any(${paidEventNames})
          and created_at > now() - interval '30 days'
      ) as paid_count_30d
  `;

  const buildFunnel = (input: { ctaClicks: number; signupCount: number; checkoutClicks: number; paidCount: number }) => ({
    ...input,
    clickToSignupRate: input.ctaClicks ? Number(((input.signupCount / input.ctaClicks) * 100).toFixed(1)) : 0,
    signupToCheckoutRate: input.signupCount ? Number(((input.checkoutClicks / input.signupCount) * 100).toFixed(1)) : 0,
    checkoutToPaidRate: input.checkoutClicks ? Number(((input.paidCount / input.checkoutClicks) * 100).toFixed(1)) : 0,
    clickToPaidRate: input.ctaClicks ? Number(((input.paidCount / input.ctaClicks) * 100).toFixed(1)) : 0
  });

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
    lastRequestAt: row?.last_request_at ?? null,
    ctaClicks7d: row?.cta_clicks_7d ?? 0,
    ctaClicks30d: row?.cta_clicks_30d ?? 0,
    checkoutClicks7d: row?.checkout_clicks_7d ?? 0,
    checkoutClicks30d: row?.checkout_clicks_30d ?? 0,
    interviewStarts7d: row?.interview_starts_7d ?? 0,
    interviewStarts30d: row?.interview_starts_30d ?? 0,
    interviewFollowUps7d: row?.interview_followups_7d ?? 0,
    interviewFollowUps30d: row?.interview_followups_30d ?? 0,
    pdfExports7d: row?.pdf_exports_7d ?? 0,
    pdfExports30d: row?.pdf_exports_30d ?? 0,
    resultCardDownloads7d: row?.result_card_downloads_7d ?? 0,
    resultCardDownloads30d: row?.result_card_downloads_30d ?? 0,
    resultShares7d: row?.result_shares_7d ?? 0,
    resultShares30d: row?.result_shares_30d ?? 0,
    resultShareX7d: row?.result_share_x_7d ?? 0,
    resultShareX30d: row?.result_share_x_30d ?? 0,
    resultShareWhatsApp7d: row?.result_share_whatsapp_7d ?? 0,
    resultShareWhatsApp30d: row?.result_share_whatsapp_30d ?? 0,
    resultShareLinkedIn7d: row?.result_share_linkedin_7d ?? 0,
    resultShareLinkedIn30d: row?.result_share_linkedin_30d ?? 0,
    writingStarts7d: row?.writing_starts_7d ?? 0,
    writingStarts30d: row?.writing_starts_30d ?? 0,
    writingEvaluations7d: row?.writing_evaluations_7d ?? 0,
    writingEvaluations30d: row?.writing_evaluations_30d ?? 0,
    writingRetries7d: row?.writing_retries_7d ?? 0,
    writingRetries30d: row?.writing_retries_30d ?? 0,
    writingPdfExports7d: row?.writing_pdf_exports_7d ?? 0,
    writingPdfExports30d: row?.writing_pdf_exports_30d ?? 0,
    topCtas: topCtaRows.map((item) => ({
      path: item.path ?? "Unknown CTA",
      event: item.event,
      count: item.count
    })),
    bestPerformingCtas: bestPerformingCtaRows.map((item) => ({
      path: item.path ?? "Unknown CTA",
      clicks: item.clicks,
      signups: item.signups,
      paidCount: item.paid_count,
      clickToSignupRate: item.clicks ? Number(((item.signups / item.clicks) * 100).toFixed(1)) : 0,
      clickToPaidRate: item.clicks ? Number(((item.paid_count / item.clicks) * 100).toFixed(1)) : 0
    })),
    winnerCta7d: winnerCtaRow
      ? {
          path: winnerCtaRow.path ?? "Unknown CTA",
          clicks: winnerCtaRow.clicks,
          signups: winnerCtaRow.signups,
          paidCount: winnerCtaRow.paid_count,
          clickToSignupRate: winnerCtaRow.clicks ? Number(((winnerCtaRow.signups / winnerCtaRow.clicks) * 100).toFixed(1)) : 0,
          clickToPaidRate: winnerCtaRow.clicks ? Number(((winnerCtaRow.paid_count / winnerCtaRow.clicks) * 100).toFixed(1)) : 0
        }
      : null,
    topCtaPages: topPageRows.map((item) => ({
      page: item.page ?? "/",
      clicks: item.clicks,
      checkoutClicks: item.checkout_clicks
    })),
    ctaTrend14d: trendRows.map((item) => ({
      date: item.date,
      ctaClicks: item.cta_clicks,
      signupCount: item.signup_count,
      checkoutClicks: item.checkout_clicks,
      paidCount: item.paid_count
    })),
    funnel7d: buildFunnel({
      ctaClicks: funnelRow?.cta_clicks_7d ?? 0,
      signupCount: funnelRow?.signup_count_7d ?? 0,
      checkoutClicks: funnelRow?.checkout_clicks_7d ?? 0,
      paidCount: funnelRow?.paid_count_7d ?? 0
    }),
    funnel30d: buildFunnel({
      ctaClicks: funnelRow?.cta_clicks_30d ?? 0,
      signupCount: funnelRow?.signup_count_30d ?? 0,
      checkoutClicks: funnelRow?.checkout_clicks_30d ?? 0,
      paidCount: funnelRow?.paid_count_30d ?? 0
    })
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

  const members = rows.map((row) => ({
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
    passwordStatus: (row.password_hash ? "protected" : "no_password") as "protected" | "no_password",
    createdAt: row.created_at,
    monthlyValue: planWeeklyValue(row.plan, row.member_type, row.institution_price),
    activeSessionCount: row.active_session_count,
    lastSignInAt: row.last_signin_at,
    lastSignOutAt: row.last_signout_at,
    totalPracticeSessions: row.total_practice_sessions,
    averageScore: row.average_score,
    teacherNoteCount: row.teacher_note_count,
    emailLog: [] as Array<{ id: string; template: string; subject: string; status: string; sentAt: string; errorMessage?: string | null }>
  }));

  // Fetch email logs for all members in one query
  const memberIds = rows.map(r => r.id);
  const emailLogMap: Record<string, Array<{ id: string; template: string; subject: string; status: string; sentAt: string; errorMessage?: string | null }>> = {};

  if (memberIds.length > 0) {
    const logRows = await sql<Array<{
      id: string;
      user_id: string;
      template: string;
      subject: string;
      status: string;
      sent_at: string;
      error_message: string | null;
    }>>`
      select id, user_id, template, subject, status, sent_at::text, error_message
      from email_log
      where user_id = any(${memberIds})
      order by sent_at desc
    `.catch(() => [] as Array<{ id: string; user_id: string; template: string; subject: string; status: string; sent_at: string; error_message: string | null }>);

    for (const log of logRows) {
      if (!emailLogMap[log.user_id]) emailLogMap[log.user_id] = [];
      emailLogMap[log.user_id].push({
        id: log.id,
        template: log.template,
        subject: log.subject,
        status: log.status,
        sentAt: log.sent_at,
        errorMessage: log.error_message
      });
    }
  }

  return members.map(m => ({ ...m, emailLog: emailLogMap[m.id] ?? [] }));
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

export async function listUserEmailLog(userId: string): Promise<Array<{
  id: string;
  template: string;
  subject: string;
  status: string;
  sentAt: string;
  errorMessage?: string | null;
}>> {
  if (!hasDatabaseUrl()) return [];
  const sql = getSql();
  const rows = await sql<Array<{
    id: string;
    template: string;
    subject: string;
    status: string;
    sent_at: string;
    error_message: string | null;
  }>>`
    select id, template, subject, status, sent_at::text, error_message
    from email_log
    where user_id = ${userId}
    order by sent_at desc
    limit 50
  `.catch(() => [] as Array<{ id: string; template: string; subject: string; status: string; sent_at: string; error_message: string | null }>);
  return rows.map(r => ({
    id: r.id,
    template: r.template,
    subject: r.subject,
    status: r.status,
    sentAt: r.sent_at,
    errorMessage: r.error_message
  }));
}
