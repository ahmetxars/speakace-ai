/**
 * Centralized authorization helpers.
 *
 * Every helper either returns the verified profile / resource or throws an
 * error that the calling route handler should turn into a 403 response.  No
 * helper silently returns null so callers can never accidentally skip the
 * check by forgetting a null guard.
 *
 * Hierarchy:
 *   requireAuthenticatedUser
 *     └─ requireStudent          (member, not a teacher/admin)
 *     └─ requireTeacher          (isTeacher flag set by explicit grant)
 *     └─ requireSchoolAdmin      (isAdmin flag set by explicit grant)
 *          └─ requireSchoolOwnsTeacher   (teacher's org_id === admin's org_id)
 *          └─ requireSchoolOwnsStudent   (student's org_id === admin's org_id)
 *          └─ requireSchoolOwnsClass     (class → teacher → same org)
 *     └─ requireTeacherOwnsClass  (class.teacher_id === teacher.id)
 *     └─ requireTeacherOwnsStudent (student enrolled in one of teacher's classes)
 */

import { cookies } from "next/headers";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { MemberProfile } from "@/lib/types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getSessionProfile(): Promise<MemberProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

function deny(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 403 });
}

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/** Returns the authenticated member or throws 401. */
export async function requireAuthenticatedUser(): Promise<MemberProfile> {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "guest") {
    throw Object.assign(new Error("Authentication required."), { statusCode: 401 });
  }
  return profile;
}

/**
 * Returns the profile if the user is a plain student (not a teacher/admin).
 * Teachers and admins are rejected so they cannot accidentally use student-only
 * endpoints (e.g. class join) from privileged accounts.
 */
export async function requireStudent(): Promise<MemberProfile> {
  const profile = await requireAuthenticatedUser();
  if (profile.isAdmin || profile.isTeacher) {
    deny("This endpoint is for student accounts only.");
  }
  return profile;
}

/**
 * Returns the profile if the caller has an explicit teacher grant.
 * Grant sources (in order of trust):
 *   1. TEACHER_EMAILS env var  (platform-level config)
 *   2. teacher_access = true in DB  (set by platform admin or org admin)
 *   3. organization_memberships.role IN ('teacher','admin','owner') for the user
 * memberType alone is NOT sufficient (fixes C-1 / privilege escalation).
 */
export async function requireTeacher(): Promise<MemberProfile> {
  const profile = await requireAuthenticatedUser();
  if (!profile.isTeacher && !profile.isAdmin) {
    deny("Teacher access required.");
  }
  return profile;
}

/**
 * Returns the profile if the caller is a school/institution admin.
 * Grant sources:
 *   1. ADMIN_EMAILS env var
 *   2. admin_access = true in DB
 *   3. organization_memberships.role IN ('admin','owner') for the user
 * memberType alone is NOT sufficient (fixes C-1).
 */
export async function requireSchoolAdmin(): Promise<MemberProfile> {
  const profile = await requireAuthenticatedUser();
  if (!profile.isAdmin) {
    deny("School admin access required.");
  }
  return profile;
}

// ---------------------------------------------------------------------------
// Teacher ownership checks
// ---------------------------------------------------------------------------

/**
 * Verifies that classId exists and belongs to the given teacher.
 * Returns the raw class row on success; throws on failure.
 */
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

  // Memory fallback: delegate to the classroom-store check
  const { ensureTeacherOwnsClass } = await import("@/lib/classroom-store");
  return ensureTeacherOwnsClass(teacherId, classId);
}

/**
 * Verifies that the student is enrolled (approved) in at least one of the
 * teacher's classes.  Returns the student's MemberProfile on success.
 */
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

  // Memory fallback
  const { getTeacherStudentDetail } = await import("@/lib/classroom-store");
  const detail = await getTeacherStudentDetail({ teacherId, studentId });
  return detail.student;
}

// ---------------------------------------------------------------------------
// School ownership checks
// ---------------------------------------------------------------------------

/**
 * Verifies that the target teacher is a member of the admin's organization.
 * Returns the teacher's MemberProfile.
 */
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
        and m.org_id = ${adminOrgId}
        and m.role in ('teacher', 'admin', 'owner')
      limit 1
    `;
    if (!rows[0]) deny("Teacher does not belong to your organization.");
    return rows[0];
  }

  deny("Organization checks require a database connection.");
}

/**
 * Verifies that the target student is a member (any role) of the admin's org.
 */
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
      join organization_memberships m on m.user_id = u.id
      where u.id = ${studentId}
        and m.org_id = ${adminOrgId}
      limit 1
    `;
    if (!rows[0]) deny("Student does not belong to your organization.");
    return rows[0];
  }

  deny("Organization checks require a database connection.");
}

/**
 * Verifies that the class belongs to a teacher who is a member of the admin's org.
 */
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
        and m.org_id = ${adminOrgId}
        and m.role in ('teacher', 'admin', 'owner')
      limit 1
    `;
    if (!rows[0]) deny("Class does not belong to your organization.");
    return rows[0];
  }

  deny("Organization checks require a database connection.");
}

// ---------------------------------------------------------------------------
// Convenience: parse a 403-throwing error into a Next.js JSON response
// ---------------------------------------------------------------------------

export function permissionErrorResponse(error: unknown): Response {
  const err = error instanceof Error ? error : new Error(String(error));
  const status = (err as Error & { statusCode?: number }).statusCode ?? 403;
  return Response.json({ error: err.message }, { status });
}
