import { TeacherStudentDetail } from "@/components/teacher-student-detail";
import { requireTeacherDashboardPage } from "@/lib/server/dashboard-access";

export default async function TeacherStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacherDashboardPage();
  const { id } = await params;
  return <TeacherStudentDetail studentId={id} />;
}
