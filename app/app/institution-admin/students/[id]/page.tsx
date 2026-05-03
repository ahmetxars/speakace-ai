import { InstitutionStudentDetail } from "@/components/institution-student-detail";
import { requireSchoolDashboardPage } from "@/lib/server/dashboard-access";

export default async function InstitutionStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSchoolDashboardPage();
  const { id } = await params;
  return <InstitutionStudentDetail studentId={id} />;
}
