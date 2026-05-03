import { ImprovementHub } from "@/components/improvement-hub";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function ImprovementHubPage() {
  await redirectPrivilegedDashboardUsers();
  return <ImprovementHub />;
}
