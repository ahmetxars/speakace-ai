import { InstitutionTeacherDetail } from "@/components/institution-teacher-detail";
import { requireSchoolDashboardPage } from "@/lib/server/dashboard-access";

export default async function InstitutionTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSchoolDashboardPage();
  const { id } = await params;
  return <InstitutionTeacherDetail teacherId={id} />;
}
