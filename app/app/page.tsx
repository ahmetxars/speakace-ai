import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { resolveDashboardRole } from "@/lib/roles";

export default async function AppDashboardPage() {
  const profile = await getAuthenticatedUserFromCookies();
  const role = resolveDashboardRole(profile);

  if (role === "teacher") {
    redirect("/app/teacher");
  }

  if (role === "school") {
    redirect("/app/institution-admin");
  }

  return <Dashboard />;
}
