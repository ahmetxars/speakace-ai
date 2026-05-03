import { TeacherHub } from "@/components/teacher-hub";
import { requireTeacherDashboardPage } from "@/lib/server/dashboard-access";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacherDashboardPage();
  const { id } = await params;
  return <TeacherHub initialClassId={id} />;
}
