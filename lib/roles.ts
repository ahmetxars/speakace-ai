import { MemberProfile } from "@/lib/types";

export type DashboardRole = "guest" | "student" | "teacher" | "school";

export function resolveDashboardRole(profile: MemberProfile | null | undefined): DashboardRole {
  if (!profile || profile.role === "guest") {
    return "guest";
  }

  if (profile.isAdmin || profile.adminAccess || profile.memberType === "school") {
    return "school";
  }

  if (profile.isTeacher || profile.teacherAccess) {
    return "teacher";
  }

  return "student";
}

export function isStudentRole(profile: MemberProfile | null | undefined) {
  return resolveDashboardRole(profile) === "student";
}
