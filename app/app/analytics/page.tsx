import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function AnalyticsPage() {
  await redirectPrivilegedDashboardUsers();
  return <AnalyticsDashboard />;
}
