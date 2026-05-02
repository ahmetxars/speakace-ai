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
  // Grant admin only from explicit DB flag or platform-level ADMIN_EMAILS config.
  // memberType === "school" is intentionally excluded: users select their own
  // memberType at signup, so treating it as a privilege grant was a critical
  // privilege-escalation vector (audit finding C-1).
  const grantAdmin = profile.adminAccess || isAdminEmail(profile.email);
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
