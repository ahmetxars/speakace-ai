import { Suspense } from "react";
import { PracticeConsole } from "@/components/practice-console";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function PracticePage() {
  await redirectPrivilegedDashboardUsers();
  return (
    <Suspense fallback={null}>
      <PracticeConsole />
    </Suspense>
  );
}
