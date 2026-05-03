import { InstitutionAnalytics } from "@/components/institution-analytics";
import { requireTeacherDashboardPage } from "@/lib/server/dashboard-access";

export default async function InstitutionAnalyticsPage() {
  await requireTeacherDashboardPage();
  return <InstitutionAnalytics />;
}
