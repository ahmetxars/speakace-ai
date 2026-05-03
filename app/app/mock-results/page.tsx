import { MockExamReport } from "@/components/mock-exam-report";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function MockResultsPage() {
  await redirectPrivilegedDashboardUsers();
  return <MockExamReport />;
}
