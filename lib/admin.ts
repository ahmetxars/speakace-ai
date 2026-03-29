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
  if (!isAdminEmail(profile.email)) {
    return withTeacherPrivileges(profile);
  }

  return withTeacherPrivileges({
    ...profile,
    isAdmin: true,
    plan: "pro"
  });
}
