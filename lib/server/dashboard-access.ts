import { redirect } from "next/navigation";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { resolveDashboardRole } from "@/lib/roles";

export async function requireTeacherDashboardPage() {
  const profile = await getAuthenticatedUserFromCookies();
  const role = resolveDashboardRole(profile);

  if (role === "school") {
    redirect("/app/institution-admin");
  }

  if (role !== "teacher") {
    redirect("/app");
  }

  return profile;
}

export async function requireSchoolDashboardPage() {
  const profile = await getAuthenticatedUserFromCookies();
  const role = resolveDashboardRole(profile);

  if (role === "teacher") {
    redirect("/app/teacher");
  }

  if (role !== "school") {
    redirect("/app");
  }

  return profile;
}

export async function redirectPrivilegedDashboardUsers() {
  const profile = await getAuthenticatedUserFromCookies();
  const role = resolveDashboardRole(profile);

  if (role === "teacher") {
    redirect("/app/teacher");
  }

  if (role === "school") {
    redirect("/app/institution-admin");
  }

  return profile;
}
