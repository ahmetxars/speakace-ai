import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { listAdminCustomBlogPosts } from "@/lib/server/custom-blog";
import {
  getAdminOverview,
  getAdminPanelSession,
  getAdminSessionCookieName,
  listAdminAuthActivity,
  listAdminBillingEvents,
  listAdminMembers,
  listInstitutionBreakdown,
  listReferralCodes
} from "@/lib/server/admin-panel";
import { resolveEmailLifecycleDailyBudget } from "@/lib/server/email-sequences";

export default async function AdminPage() {
  let session: Awaited<ReturnType<typeof getAdminPanelSession>> = null;

  try {
    const cookieStore = await cookies();
    session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);
  } catch {
    redirect("/admin/login");
  }

  if (!session) {
    redirect("/admin/login");
  }

  try {
    const [overviewResult, membersResult, billingEventsResult, authActivityResult, referralCodesResult, institutionsResult, customPostsResult] =
      await Promise.allSettled([
        getAdminOverview(),
        listAdminMembers(),
        listAdminBillingEvents(),
        listAdminAuthActivity(),
        listReferralCodes(),
        listInstitutionBreakdown(),
        listAdminCustomBlogPosts()
      ]);

    const overview =
      overviewResult.status === "fulfilled"
        ? overviewResult.value
        : {
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
            aiRequests30d: 0,
            aiInputTokens30d: 0,
            aiOutputTokens30d: 0,
            aiEstimatedCost30d: 0,
            liveUsers5m: 0,
            requests5m: 0,
            pageViews1h: 0,
            lastRequestAt: null,
            emailSent24h: 0,
            emailFailed24h: 0,
            emailQuotaBlocked: false,
            dayOneReturnStarts30d: 0,
            ctaClicks7d: 0,
            ctaClicks30d: 0,
            checkoutClicks7d: 0,
            checkoutClicks30d: 0,
            pricingViews7d: 0,
            pricingViews30d: 0,
            pricingPlusClicks7d: 0,
            pricingPlusClicks30d: 0,
            practiceLimitHits7d: 0,
            practiceLimitHits30d: 0,
            upgradePromptViews7d: 0,
            upgradePromptViews30d: 0,
            practiceLimitRecoveryEnabled: process.env.ENABLE_PRACTICE_LIMIT_RECOVERY_EMAILS === "true",
            practiceLimitRecoverySent7d: 0,
            practiceLimitRecoverySent30d: 0,
            practiceLimitRecoveryCheckoutStarts7d: 0,
            practiceLimitRecoveryCheckoutStarts30d: 0,
            checkoutInitiated7d: 0,
            checkoutInitiated30d: 0,
            checkoutCompleted7d: 0,
            checkoutCompleted30d: 0,
            billingSuccessSeen7d: 0,
            billingSuccessSeen30d: 0,
            billingSyncPending7d: 0,
            billingSyncPending30d: 0,
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
            shareAttributedSignups7d: 0,
            shareAttributedSignups30d: 0,
            topShareSignupSources: [],
            topSharedSpeakingPrompts: [],
            topSharedBadges: [],
            topSharedIdentitySegments: [],
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
            topCheckoutSources: [],
            winnerCta7d: null,
            topCtaPages: [],
            ctaTrend14d: [],
            monetizationFunnel7d: {
              pricingViews: 0,
              practiceLimitHits: 0,
              upgradePromptViews: 0,
              checkoutInitiated: 0,
              checkoutCompleted: 0,
              billingSuccessSeen: 0,
              pricingViewToCheckoutRate: 0,
              limitHitToCheckoutRate: 0,
              checkoutToCompletionRate: 0
            },
            monetizationFunnel30d: {
              pricingViews: 0,
              practiceLimitHits: 0,
              upgradePromptViews: 0,
              checkoutInitiated: 0,
              checkoutCompleted: 0,
              billingSuccessSeen: 0,
              pricingViewToCheckoutRate: 0,
              limitHitToCheckoutRate: 0,
              checkoutToCompletionRate: 0
            },
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
    const members = membersResult.status === "fulfilled" ? membersResult.value : [];
    const billingEvents = billingEventsResult.status === "fulfilled" ? billingEventsResult.value : [];
    const authActivity = authActivityResult.status === "fulfilled" ? authActivityResult.value : [];
    const referralCodes = referralCodesResult.status === "fulfilled" ? referralCodesResult.value : [];
    const institutions = institutionsResult.status === "fulfilled" ? institutionsResult.value : [];
    const customPosts = customPostsResult.status === "fulfilled" ? customPostsResult.value : [];
    const systemHealth = {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "—",
      vercelEnv: process.env.VERCEL_ENV ?? "unknown",
      region: process.env.VERCEL_REGION ?? "—",
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      lemonWebhookConfigured: Boolean(process.env.LEMON_SQUEEZY_WEBHOOK_SECRET),
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      analyticsConfigured: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
      lifecycleDailyBudget: resolveEmailLifecycleDailyBudget()
    };

    const payload = JSON.parse(
      JSON.stringify({
        sessionLabel: session.adminLabel,
        systemHealth,
        overview,
        members,
        billingEvents,
        authActivity,
        referralCodes,
        institutions,
        customPosts
      })
    ) as {
      sessionLabel: string;
      systemHealth: typeof systemHealth;
      overview: typeof overview;
      members: typeof members;
      billingEvents: typeof billingEvents;
      authActivity: typeof authActivity;
      referralCodes: typeof referralCodes;
      institutions: typeof institutions;
      customPosts: typeof customPosts;
    };

    return (
      <AdminPanel
        sessionLabel={payload.sessionLabel}
        systemHealth={payload.systemHealth}
        overview={payload.overview}
        members={payload.members}
        billingEvents={payload.billingEvents}
        authActivity={payload.authActivity}
        referralCodes={payload.referralCodes}
        institutions={payload.institutions}
        customPosts={payload.customPosts}
      />
    );
  } catch {
    return (
      <main className="page-shell section">
        <div className="card" style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem", display: "grid", gap: "0.85rem" }}>
          <span className="eyebrow">Admin panel</span>
          <h1 style={{ margin: 0 }}>Admin data is temporarily unavailable</h1>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            The admin session is valid, but one of the data queries failed while loading the dashboard. Try refreshing once or sign in again.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a className="button button-primary" href="/admin/login">
              Re-open admin login
            </a>
            <a className="button button-secondary" href="/admin">
              Refresh admin page
            </a>
          </div>
        </div>
      </main>
    );
  }
}
