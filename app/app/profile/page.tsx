import { StudentProfile } from "@/components/student-profile";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function StudentProfilePage() {
  await redirectPrivilegedDashboardUsers();
  return <StudentProfile />;
}
