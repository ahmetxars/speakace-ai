import { InstitutionAdminPanel } from "@/components/institution-admin-panel";
import { requireSchoolDashboardPage } from "@/lib/server/dashboard-access";

export default async function InstitutionAdminPage() {
  await requireSchoolDashboardPage();
  return <InstitutionAdminPanel />;
}
