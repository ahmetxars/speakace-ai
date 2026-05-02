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
  // Grant teacher only from explicit DB flag or platform-level TEACHER_EMAILS config.
  // memberType === "teacher" is intentionally excluded: it is self-selected at
  // signup and was a privilege-escalation vector (audit finding C-1).
  const grantTeacher = profile.teacherAccess || isTeacherEmail(profile.email);
  if (!grantTeacher) {
    return profile;
  }

  return {
    ...profile,
    teacherAccess: true,
    isTeacher: true,
    plan: "pro"
  };
}
