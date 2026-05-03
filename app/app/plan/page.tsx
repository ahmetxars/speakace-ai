import { StudyPlanBoard } from "@/components/study-plan-board";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function StudyPlanPage() {
  await redirectPrivilegedDashboardUsers();
  return <StudyPlanBoard />;
}
