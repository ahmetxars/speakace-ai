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

export function isPlatformAdmin(profile: Pick<MemberProfile, "email" | "emailVerified">) {
  return profile.emailVerified === true && isAdminEmail(profile.email);
}

export function withAdminPrivileges(profile: MemberProfile): MemberProfile {
  // adminAccess is a legacy institution flag and must never authorize platform access.
  const isAdmin = profile.role === "member" && isPlatformAdmin(profile);
  return withTeacherPrivileges({
    ...profile,
    isAdmin,
    ...(isAdmin ? { plan: "pro" as const } : {})
  });
}
