import { TeacherStudentCompare } from "@/components/teacher-student-compare";
import { requireTeacherDashboardPage } from "@/lib/server/dashboard-access";

export default async function TeacherStudentComparePage() {
  await requireTeacherDashboardPage();
  return <TeacherStudentCompare />;
}
