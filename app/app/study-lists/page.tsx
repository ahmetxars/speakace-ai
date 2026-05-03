import { StudyListsBoard } from "@/components/study-lists-board";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function StudyListsPage() {
  await redirectPrivilegedDashboardUsers();
  return <StudyListsBoard />;
}
