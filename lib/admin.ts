import { MemberProfile } from "@/lib/types";
import { withTeacherPrivileges } from "@/lib/teacher";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(normalizeEmail(email));
}

export function withAdminPrivileges(profile: MemberProfile): MemberProfile {
  const grantAdmin = profile.adminAccess || isAdminEmail(profile.email) || profile.memberType === "school";
  if (!grantAdmin) {
    return withTeacherPrivileges(profile);
  }

  return withTeacherPrivileges({
    ...profile,
    adminAccess: true,
    isAdmin: true,
    plan: "pro"
  });
}
