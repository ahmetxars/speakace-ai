/**
 * Centralized authorization helpers.
 *
 * Every helper either returns the verified profile / resource or throws an
 * error that the calling route handler should turn into a 403 response. No
 * helper silently returns null so callers can never accidentally skip the
 * check by forgetting a null guard.
 */

import { cookies } from "next/headers";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { MemberProfile } from "@/lib/types";

async function getSessionProfile(): Promise<MemberProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

function deny(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 403 });
}

export async function requireAuthenticatedUser(): Promise<MemberProfile> {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "guest") {
    throw Object.assign(new Error("Authentication required."), { statusCode: 401 });
  }
  return profile;
}

export async function requireStudent(): Promise<MemberProfile> {
  const profile = await requireAuthenticatedUser();
  if (profile.isAdmin || profile.isTeacher) {
    deny("This endpoint is for student accounts only.");
  }
  return profile;
}

export async function requireTeacher(): Promise<MemberProfile> {
  const profile = await requireAuthenticatedUser();
  if (!profile.isTeacher) {
    deny("Teacher access required.");
  }
  return profile;
}

export async function requireSchoolAdmin(): Promise<MemberProfile> {
  const profile = await requireAuthenticatedUser();
  if (profile.isAdmin) {
    return profile;
  }
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ id: string }>>`
      select u.id
      from users u
      join organization_memberships m on m.user_id = u.id
      where u.id = ${profile.id}
        and m.organization_id = u.organization_id
        and m.role in ('admin', 'owner')
      limit 1
    `;
    if (rows[0]) {
      return profile;
    }
  }
  deny("School admin access required.");
}

export async function requireTeacherOwnsClass(
  teacherId: string,
  classId: string
): Promise<{ id: string; teacherId: string; name: string }> {
  if (!classId) deny("Class ID is required.");

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ id: string; teacherId: string; name: string }>>`
      select id, teacher_id as "teacherId", name
      from teacher_classes
      where id = ${classId} and teacher_id = ${teacherId}
      limit 1
    `;
    if (!rows[0]) deny("Class not found or access denied.");
    return rows[0];
  }

  const { ensureTeacherOwnsClass } = await import("@/lib/classroom-store");
  return ensureTeacherOwnsClass(teacherId, classId);
}

export async function requireTeacherOwnsStudent(
  teacherId: string,
  studentId: string
): Promise<MemberProfile> {
  if (!studentId) deny("Student ID is required.");

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ id: string }>>`
      select u.id
      from teacher_class_enrollments e
      join teacher_classes c on c.id = e.class_id
      join users u on u.id = e.student_id
      where c.teacher_id = ${teacherId}
        and e.student_id = ${studentId}
        and e.status = 'approved'
      limit 1
    `;
    if (!rows[0]) deny("Student is not enrolled in one of your classes.");

    const profileRows = await sql<MemberProfile[]>`
      select id, email, name, role, member_type as "memberType",
             organization_name as "organizationName", organization_id as "organizationId",
             plan, email_verified as "emailVerified",
             admin_access as "adminAccess", teacher_access as "teacherAccess",
             created_at as "createdAt"
      from users where id = ${studentId} limit 1
    `;
    if (!profileRows[0]) deny("Student not found.");
    return profileRows[0];
  }

  const { getTeacherStudentDetail } = await import("@/lib/classroom-store");
  const detail = await getTeacherStudentDetail({ teacherId, studentId });
  return detail.student;
}

export async function requireSchoolOwnsTeacher(
  adminOrgId: string,
  teacherId: string
): Promise<MemberProfile> {
  if (!adminOrgId) deny("No organization associated with your account.");
  if (!teacherId) deny("Teacher ID is required.");

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select u.id, u.email, u.name, u.role,
             u.member_type as "memberType",
             u.organization_name as "organizationName",
             u.organization_id as "organizationId",
             u.plan, u.email_verified as "emailVerified",
             u.admin_access as "adminAccess", u.teacher_access as "teacherAccess",
             u.created_at as "createdAt"
      from users u
      join organization_memberships m on m.user_id = u.id
      where u.id = ${teacherId}
        and m.organization_id = ${adminOrgId}
        and m.role in ('teacher', 'admin', 'owner')
      limit 1
    `;
    if (!rows[0]) deny("Teacher does not belong to your organization.");
    return rows[0];
  }

  deny("Organization checks require a database connection.");
}

export async function requireSchoolOwnsStudent(
  adminOrgId: string,
  studentId: string
): Promise<MemberProfile> {
  if (!adminOrgId) deny("No organization associated with your account.");
  if (!studentId) deny("Student ID is required.");

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<MemberProfile[]>`
      select u.id, u.email, u.name, u.role,
             u.member_type as "memberType",
             u.organization_name as "organizationName",
             u.organization_id as "organizationId",
             u.plan, u.email_verified as "emailVerified",
             u.admin_access as "adminAccess", u.teacher_access as "teacherAccess",
             u.created_at as "createdAt"
      from users u
      join teacher_class_enrollments e on e.student_id = u.id and e.status = 'approved'
      join teacher_classes c on c.id = e.class_id
      join organization_memberships m on m.user_id = c.teacher_id
      where u.id = ${studentId}
        and m.organization_id = ${adminOrgId}
      limit 1
    `;
    if (!rows[0]) deny("Student does not belong to your organization.");
    return rows[0];
  }

  deny("Organization checks require a database connection.");
}

export async function requireSchoolOwnsClass(
  adminOrgId: string,
  classId: string
): Promise<{ id: string; teacherId: string; name: string }> {
  if (!adminOrgId) deny("No organization associated with your account.");
  if (!classId) deny("Class ID is required.");

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ id: string; teacherId: string; name: string }>>`
      select c.id, c.teacher_id as "teacherId", c.name
      from teacher_classes c
      join organization_memberships m on m.user_id = c.teacher_id
      where c.id = ${classId}
        and m.organization_id = ${adminOrgId}
        and m.role in ('teacher', 'admin', 'owner')
      limit 1
    `;
    if (!rows[0]) deny("Class does not belong to your organization.");
    return rows[0];
  }

  deny("Organization checks require a database connection.");
}

export function permissionErrorResponse(error: unknown): Response {
  const err = error instanceof Error ? error : new Error(String(error));
  const status = (err as Error & { statusCode?: number }).statusCode ?? 400;
  return Response.json({ error: err.message }, { status });
}
