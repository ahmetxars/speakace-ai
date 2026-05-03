import { MockExamLaunchpad } from "@/components/mock-exam-launchpad";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function MockExamPage() {
  await redirectPrivilegedDashboardUsers();
  return <MockExamLaunchpad />;
}
