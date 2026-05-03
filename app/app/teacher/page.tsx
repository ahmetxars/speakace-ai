import { TeacherHub } from "@/components/teacher-hub";
import { requireTeacherDashboardPage } from "@/lib/server/dashboard-access";

export default async function TeacherPage() {
  await requireTeacherDashboardPage();
  return <TeacherHub />;
}
