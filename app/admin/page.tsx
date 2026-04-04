import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
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
    const [overviewResult, membersResult, billingEventsResult, authActivityResult, referralCodesResult, institutionsResult] =
      await Promise.allSettled([
        getAdminOverview(),
        listAdminMembers(),
        listAdminBillingEvents(),
        listAdminAuthActivity(),
        listReferralCodes(),
        listInstitutionBreakdown()
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
            monthlyRevenueEstimate: 0
          };
    const members = membersResult.status === "fulfilled" ? membersResult.value : [];
    const billingEvents = billingEventsResult.status === "fulfilled" ? billingEventsResult.value : [];
    const authActivity = authActivityResult.status === "fulfilled" ? authActivityResult.value : [];
    const referralCodes = referralCodesResult.status === "fulfilled" ? referralCodesResult.value : [];
    const institutions = institutionsResult.status === "fulfilled" ? institutionsResult.value : [];

    const payload = JSON.parse(
      JSON.stringify({
        sessionLabel: session.adminLabel,
        overview,
        members,
        billingEvents,
        authActivity,
        referralCodes,
        institutions
      })
    ) as {
      sessionLabel: string;
      overview: typeof overview;
      members: typeof members;
      billingEvents: typeof billingEvents;
      authActivity: typeof authActivity;
      referralCodes: typeof referralCodes;
      institutions: typeof institutions;
    };

    return (
      <AdminPanel
        sessionLabel={payload.sessionLabel}
        overview={payload.overview}
        members={payload.members}
        billingEvents={payload.billingEvents}
        authActivity={payload.authActivity}
        referralCodes={payload.referralCodes}
        institutions={payload.institutions}
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
