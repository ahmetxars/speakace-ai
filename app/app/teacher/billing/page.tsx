import { TeacherBilling } from "@/components/teacher-billing";
import { requireSchoolDashboardPage } from "@/lib/server/dashboard-access";

export default async function TeacherBillingPage() {
  await requireSchoolDashboardPage();
  return <TeacherBilling />;
}
