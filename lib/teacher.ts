import { MemberProfile } from "@/lib/types";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getTeacherEmails() {
  const raw = process.env.TEACHER_EMAILS ?? "";
  return raw
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

export function isTeacherEmail(email: string) {
  return getTeacherEmails().includes(normalizeEmail(email));
}

export function withTeacherPrivileges(profile: MemberProfile): MemberProfile {
  if (!profile.teacherAccess && !isTeacherEmail(profile.email)) {
    return profile;
  }

  return {
    ...profile,
    teacherAccess: true,
    isTeacher: true,
    plan: "pro"
  };
}
