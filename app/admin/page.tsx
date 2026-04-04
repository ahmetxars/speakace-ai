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
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);

  if (!session) {
    redirect("/admin/login");
  }

  const [overview, members, billingEvents, authActivity, referralCodes, institutions] = await Promise.all([
    getAdminOverview(),
    listAdminMembers(),
    listAdminBillingEvents(),
    listAdminAuthActivity(),
    listReferralCodes(),
    listInstitutionBreakdown()
  ]);

  return (
    <AdminPanel
      sessionLabel={session.adminLabel}
      overview={overview}
      members={members}
      billingEvents={billingEvents}
      authActivity={authActivity}
      referralCodes={referralCodes}
      institutions={institutions}
    />
  );
}
