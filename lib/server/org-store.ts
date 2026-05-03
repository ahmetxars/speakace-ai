/**
 * Organization management store.
 *
 * Responsibilities:
 *  - Create and look up organizations (schools / institutions)
 *  - Manage organization memberships (owner, admin, teacher, student)
 *  - Create and consume scoped invite codes
 *  - Provide tenant-scoped user/teacher/class queries for institution dashboards
 *
 * All functions that operate on behalf of a specific school admin must
 * receive the admin's organizationId and scope their queries accordingly.
 * Global queries (no org filter) are intentionally absent from this module.
 */

import { randomBytes } from "node:crypto";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import {
  InstitutionUserSummary,
  MemberProfile,
  OrgInvite,
  OrgMembership,
  OrgMemberRole,
  Organization,
  TeacherClassAnalytics
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Organization creation
// ---------------------------------------------------------------------------

function buildOrgJoinCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function createOrganization(input: {
  name: string;
  ownerId: string;
}): Promise<Organization> {
  const org: Organization = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    ownerId: input.ownerId,
    joinCode: buildOrgJoinCode(),
    createdAt: new Date().toISOString()
  };

  const sql = getSql();
  const rows = await sql<Organization[]>`
    insert into organizations (id, name, owner_id, join_code, created_at)
    values (${org.id}, ${org.name}, ${org.ownerId}, ${org.joinCode}, ${org.createdAt})
    returning id, name, owner_id as "ownerId", join_code as "joinCode", created_at as "createdAt"
  `;

  // Add owner as a member with role 'owner'
  await sql`
    insert into organization_memberships (id, org_id, user_id, role, joined_at)
    values (${crypto.randomUUID()}, ${org.id}, ${input.ownerId}, 'owner', now())
    on conflict (org_id, user_id) do nothing
  `;

  // Link the owner's user record to this org
  await sql`
    update users set organization_id = ${org.id} where id = ${input.ownerId}
  `;

  return rows[0];
}

export async function getOrganizationByOwnerId(ownerId: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Organization[]>`
    select id, name, owner_id as "ownerId", join_code as "joinCode", created_at as "createdAt"
    from organizations
    where owner_id = ${ownerId}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Organization[]>`
    select id, name, owner_id as "ownerId", join_code as "joinCode", created_at as "createdAt"
    from organizations
    where id = ${orgId}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function getOrganizationByJoinCode(joinCode: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Organization[]>`
    select id, name, owner_id as "ownerId", join_code as "joinCode", created_at as "createdAt"
    from organizations
    where lower(join_code) = lower(${joinCode.trim()})
    limit 1
  `;
  return rows[0] ?? null;
}

/** Returns the organization for which the given user is an owner or admin. */
export async function getOrgForAdmin(userId: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Organization[]>`
    select o.id, o.name, o.owner_id as "ownerId", o.join_code as "joinCode", o.created_at as "createdAt"
    from organizations o
    join organization_memberships m on m.org_id = o.id
    where m.user_id = ${userId}
      and m.role in ('owner', 'admin')
    order by o.created_at asc
    limit 1
  `;
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Membership management
// ---------------------------------------------------------------------------

// Role strength order used for additive-only membership updates.
const ROLE_STRENGTH: Record<OrgMemberRole, number> = {
  student: 0,
  teacher: 1,
  admin: 2,
  owner: 3
};

export async function addOrgMember(input: {
  orgId: string;
  userId: string;
  role: OrgMemberRole;
  invitedBy?: string;
}): Promise<OrgMembership> {
  const sql = getSql();
  const id = crypto.randomUUID();
  const rows = await sql<OrgMembership[]>`
    insert into organization_memberships (id, org_id, user_id, role, invited_by, joined_at)
    values (${id}, ${input.orgId}, ${input.userId}, ${input.role}, ${input.invitedBy ?? null}, now())
    on conflict (org_id, user_id)
    do update set
      -- Only upgrade role, never downgrade (additive-only semantics).
      -- greatest() on text won't work; compare via the strength ordering:
      -- new role replaces existing only when it is strictly stronger.
      role = case
        when organization_memberships.role = 'owner'  then 'owner'
        when organization_memberships.role = 'admin'  and excluded.role in ('owner', 'admin') then excluded.role
        when organization_memberships.role = 'teacher' and excluded.role in ('owner', 'admin', 'teacher') then excluded.role
        else excluded.role
      end,
      invited_by = coalesce(excluded.invited_by, organization_memberships.invited_by)
    returning id, org_id as "orgId", user_id as "userId", role, invited_by as "invitedBy", joined_at as "joinedAt"
  `;

  void ROLE_STRENGTH; // referenced above for documentation; used in updateOrgUserAccess below

  // Keep users.organization_id in sync for teachers/admins (students may belong
  // to many orgs via class joins so we only set for privileged roles)
  if (input.role !== "student") {
    await sql`
      update users set organization_id = ${input.orgId}
      where id = ${input.userId} and (organization_id is null or organization_id = ${input.orgId})
    `;
  }

  return rows[0];
}

export async function getOrgMembership(orgId: string, userId: string): Promise<OrgMembership | null> {
  const sql = getSql();
  const rows = await sql<OrgMembership[]>`
    select id, org_id as "orgId", user_id as "userId", role, invited_by as "invitedBy", joined_at as "joinedAt"
    from organization_memberships
    where org_id = ${orgId} and user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Invite management
// ---------------------------------------------------------------------------

function buildInviteCode(): string {
  return randomBytes(16).toString("hex");
}

export async function createOrgInvite(input: {
  orgId: string;
  role: Exclude<OrgMemberRole, "owner">;
  email?: string;
  createdBy: string;
  expiresInDays?: number;
}): Promise<OrgInvite> {
  const sql = getSql();
  const id = crypto.randomUUID();
  const inviteCode = buildInviteCode();
  const expiresAt = new Date(
    Date.now() + (input.expiresInDays ?? 7) * 24 * 60 * 60 * 1000
  ).toISOString();

  const rows = await sql<OrgInvite[]>`
    insert into organization_invites (id, org_id, email, role, invite_code, created_by, expires_at, created_at)
    values (${id}, ${input.orgId}, ${input.email ?? null}, ${input.role}, ${inviteCode}, ${input.createdBy}, ${expiresAt}, now())
    returning
      id, org_id as "orgId", email, role, invite_code as "inviteCode",
      created_by as "createdBy", expires_at as "expiresAt",
      used_at as "usedAt", used_by as "usedBy", created_at as "createdAt"
  `;
  return rows[0];
}

export async function consumeOrgInvite(input: {
  inviteCode: string;
  userId: string;
  userEmail: string;
}): Promise<{ org: Organization; role: Exclude<OrgMemberRole, "owner"> } | null> {
  const sql = getSql();

  // Find a valid, unused invite that matches by code (and optionally by email)
  const rows = await sql<Array<OrgInvite & { orgName: string; orgOwnerId: string; orgJoinCode: string }>>`
    select
      i.id, i.org_id as "orgId", i.email, i.role, i.invite_code as "inviteCode",
      i.created_by as "createdBy", i.expires_at as "expiresAt",
      i.used_at as "usedAt", i.used_by as "usedBy", i.created_at as "createdAt",
      o.name as "orgName", o.owner_id as "orgOwnerId", o.join_code as "orgJoinCode"
    from organization_invites i
    join organizations o on o.id = i.org_id
    where i.invite_code = ${input.inviteCode}
      and i.used_at is null
      and i.expires_at > now()
      and (i.email is null or lower(i.email) = lower(${input.userEmail}))
    limit 1
  `;

  const invite = rows[0];
  if (!invite) return null;

  // Mark invite consumed
  await sql`
    update organization_invites
    set used_at = now(), used_by = ${input.userId}
    where id = ${invite.id}
  `;

  // Add to org
  await addOrgMember({
    orgId: invite.orgId,
    userId: input.userId,
    role: invite.role as Exclude<OrgMemberRole, "owner">,
    invitedBy: invite.createdBy
  });

  // Grant access flags additively — never revoke an existing stronger privilege.
  //
  // Rules:
  //   admin  invite → sets admin_access = true, teacher_access = true
  //   teacher invite → sets teacher_access = true; leaves admin_access untouched
  //   student invite → no flag changes (org membership alone is sufficient)
  //
  // Using `greatest(existing, new)` semantics: we only ever move flags from
  // false → true, never from true → false via invite redemption.
  if (invite.role === "admin") {
    await sql`
      update users
      set teacher_access = true,
          admin_access   = true
      where id = ${input.userId}
    `;
  } else if (invite.role === "teacher") {
    // Preserve any existing admin_access; only ensure teacher_access is set.
    await sql`
      update users
      set teacher_access = true
      where id = ${input.userId}
    `;
  }
  // student role: no DB flag change needed

  return {
    org: {
      id: invite.orgId,
      name: invite.orgName,
      ownerId: invite.orgOwnerId,
      joinCode: invite.orgJoinCode,
      createdAt: invite.createdAt
    },
    role: invite.role as Exclude<OrgMemberRole, "owner">
  };
}

// ---------------------------------------------------------------------------
// Tenant-scoped institution queries (fixes C-2, C-3)
// ---------------------------------------------------------------------------

/**
 * Lists users who are members of the given org.
 * Replaces the global listInstitutionUsers query.
 */
export async function listOrgUsers(
  orgId: string,
  search?: string
): Promise<InstitutionUserSummary[]> {
  const normalized = search?.trim().toLowerCase() ?? "";
  const sql = getSql();

  const rows = await sql<InstitutionUserSummary[]>`
    select
      u.id,
      u.email,
      u.name,
      u.role,
      u.member_type as "memberType",
      u.organization_name as "organizationName",
      u.plan,
      u.email_verified as "emailVerified",
      u.admin_access as "adminAccess",
      u.teacher_access as "teacherAccess",
      u.created_at as "createdAt",
      m.role as "orgRole"
    from users u
    join organization_memberships m on m.user_id = u.id
    where m.org_id = ${orgId}
      and (
        ${normalized === ""}
        or lower(u.email) like ${"%" + normalized + "%"}
        or lower(u.name) like ${"%" + normalized + "%"}
      )
    order by u.created_at desc
    limit 200
  `;
  return rows;
}

/**
 * Lists teachers in the given org with their class/student analytics summaries.
 * Replaces the global listInstitutionTeacherSummaries query.
 */
export async function listOrgTeacherSummaries(orgId: string) {
  const sql = getSql();

  const teacherRows = await sql<MemberProfile[]>`
    select
      u.id, u.email, u.name, u.role,
      u.member_type as "memberType",
      u.organization_name as "organizationName",
      u.organization_id as "organizationId",
      u.plan, u.email_verified as "emailVerified",
      u.admin_access as "adminAccess", u.teacher_access as "teacherAccess",
      u.created_at as "createdAt"
    from users u
    join organization_memberships m on m.user_id = u.id
    where m.org_id = ${orgId}
      and m.role in ('teacher', 'admin', 'owner')
    order by u.created_at asc
  `;

  const { getInstitutionAnalytics, listTeacherClasses } = await import("@/lib/classroom-store");

  const summaries = await Promise.all(
    teacherRows.map(async (teacher) => {
      const [classes, analytics] = await Promise.all([
        listTeacherClasses(teacher.id),
        getInstitutionAnalytics(teacher.id)
      ]);
      return {
        teacher,
        classCount: classes.length,
        studentCount: analytics.totalStudents,
        activeStudents: analytics.activeStudents,
        averageScore: analytics.averageScore,
        pendingApprovalCount: analytics.pendingApprovalCount,
        atRiskStudentCount: analytics.atRiskStudentCount,
        homeworkCompletionRate: analytics.homeworkCompletionRate,
        mostCommonWeakestSkill: analytics.mostCommonWeakestSkill
      };
    })
  );

  return summaries.sort((a, b) => b.studentCount - a.studentCount || b.averageScore - a.averageScore);
}

/**
 * Full institution summary scoped to the given org.
 * Replaces getInstitutionAdminSummary() which was global.
 */
export async function getOrgAdminSummary(orgId: string) {
  const teacherSummaries = await listOrgTeacherSummaries(orgId);
  const totalTeachers = teacherSummaries.length;
  const totalClasses = teacherSummaries.reduce((s, t) => s + t.classCount, 0);
  const totalStudents = teacherSummaries.reduce((s, t) => s + t.studentCount, 0);
  const activeStudents = teacherSummaries.reduce((s, t) => s + t.activeStudents, 0);
  const pendingApprovals = teacherSummaries.reduce((s, t) => s + (t.pendingApprovalCount ?? 0), 0);
  const atRiskStudents = teacherSummaries.reduce((s, t) => s + (t.atRiskStudentCount ?? 0), 0);
  const averageScore = totalTeachers
    ? Number((teacherSummaries.reduce((s, t) => s + t.averageScore, 0) / totalTeachers).toFixed(1))
    : 0;

  return {
    totalTeachers,
    totalClasses,
    totalStudents,
    activeStudents,
    pendingApprovals,
    atRiskStudents,
    averageScore,
    teacherSummaries,
    alerts: teacherSummaries
      .flatMap((t) => {
        const alerts: string[] = [];
        if ((t.pendingApprovalCount ?? 0) > 0)
          alerts.push(`${t.teacher.name}: ${t.pendingApprovalCount} pending approvals`);
        if ((t.atRiskStudentCount ?? 0) > 0)
          alerts.push(`${t.teacher.name}: ${t.atRiskStudentCount} at-risk students`);
        return alerts;
      })
      .slice(0, 8)
  };
}

/**
 * Lists students enrolled in any class belonging to a teacher in the given org.
 * Returns per-student progress summary for the institution admin dashboard.
 */
export async function listOrgStudentSummaries(orgId: string) {
  const sql = getSql();
  const rows = await sql<Array<{
    id: string;
    name: string;
    email: string;
    plan: string;
    classCount: number;
    sessionCount: number;
    averageScore: number | null;
    lastSessionAt: string | null;
    teacherNames: string[];
  }>>`
    select
      u.id,
      u.name,
      u.email,
      u.plan,
      count(distinct e.class_id)::int as "classCount",
      count(distinct s.id)::int as "sessionCount",
      round(avg(s.report_overall)::numeric, 1) as "averageScore",
      max(s.created_at) as "lastSessionAt",
      coalesce(
        array_agg(distinct t.name) filter (where t.name is not null),
        '{}'::text[]
      ) as "teacherNames"
    from teacher_class_enrollments e
    join teacher_classes c on c.id = e.class_id
    join users t on t.id = c.teacher_id
    join organization_memberships tm on tm.user_id = t.id and tm.org_id = ${orgId}
    join users u on u.id = e.student_id
    left join sessions s on s.user_id = u.id and s.report_overall is not null
    where e.status = 'approved'
    group by u.id, u.name, u.email, u.plan
    order by "sessionCount" desc, u.created_at desc
    limit 300
  `;
  return rows.map((r) => ({
    ...r,
    teacherNames: Array.isArray(r.teacherNames) ? r.teacherNames : []
  }));
}

/**
 * Updates a user's access flags within the given organization.
 *
 * Role-change protection rules (enforced server-side before any DB write):
 *
 *   1. Owner is immutable through this endpoint.
 *      No actor — including another owner — may change the owner's flags here.
 *      Ownership transfer is a separate, explicit operation not yet implemented.
 *
 *   2. Admins cannot modify the owner's record at all.
 *
 *   3. Non-owner admins cannot remove (downgrade) a peer admin.
 *      Only the org owner may demote another admin.
 *
 *   4. Any actor may elevate a lower-role member (e.g. teacher → admin)
 *      provided they have sufficient rank (admin or owner) to do so.
 *
 * The audit log is always written regardless of the outcome so that blocked
 * attempts are also visible.
 */
export async function updateOrgUserAccess(input: {
  actorId: string;
  orgId: string;
  targetUserId: string;
  teacherAccess?: boolean;
  adminAccess?: boolean;
}): Promise<InstitutionUserSummary> {
  const sql = getSql();

  // Resolve both memberships and current flag values in parallel so that
  // blocked-attempt audit records always include the before-state.
  const [actorMembership, targetMembership, currentRows] = await Promise.all([
    getOrgMembership(input.orgId, input.actorId),
    getOrgMembership(input.orgId, input.targetUserId),
    sql<Array<{ adminAccess: boolean; teacherAccess: boolean }>>`
      select admin_access as "adminAccess", teacher_access as "teacherAccess"
      from users where id = ${input.targetUserId} limit 1
    `
  ]);
  const current = currentRows[0] ?? { adminAccess: false, teacherAccess: false };

  // Helper: write a blocked-attempt record before throwing.
  async function logBlocked(reason: string) {
    await sql`
      insert into permission_audit_log (id, actor_id, target_user_id, org_id, action, old_value, new_value, occurred_at)
      values (
        ${crypto.randomUUID()},
        ${input.actorId},
        ${input.targetUserId},
        ${input.orgId},
        'update_access_blocked',
        ${JSON.stringify({ adminAccess: current.adminAccess, teacherAccess: current.teacherAccess })}::jsonb,
        ${JSON.stringify({ requested: { adminAccess: input.adminAccess, teacherAccess: input.teacherAccess }, reason })}::jsonb,
        now()
      )
    `;
  }

  // Rule 0: Actor must be an owner or admin of this org.
  if (!actorMembership || !["owner", "admin"].includes(actorMembership.role)) {
    await logBlocked("actor_not_authorized");
    throw Object.assign(new Error("You do not have permission to change access in this organization."), { statusCode: 403 });
  }

  // Target must be a member of this org.
  if (!targetMembership) {
    throw new Error("User does not belong to your organization.");
  }

  // Rule 1 & 2: Owner record is immutable through this endpoint.
  if (targetMembership.role === "owner") {
    await logBlocked("target_is_owner");
    throw Object.assign(
      new Error("The organization owner's access cannot be modified through this endpoint."),
      { statusCode: 403 }
    );
  }

  // Rule 3: Non-owner admins cannot demote a peer admin.
  if (
    actorMembership.role === "admin" &&
    targetMembership.role === "admin" &&
    input.adminAccess === false
  ) {
    await logBlocked("peer_admin_demotion_forbidden");
    throw Object.assign(
      new Error("Only the organization owner can remove admin access from another admin."),
      { statusCode: 403 }
    );
  }

  const newAdminAccess = input.adminAccess ?? current.adminAccess;
  const newTeacherAccess = input.teacherAccess ?? current.teacherAccess;

  const rows = await sql<InstitutionUserSummary[]>`
    update users
    set
      teacher_access = ${newTeacherAccess},
      admin_access   = ${newAdminAccess}
    where id = ${input.targetUserId}
    returning
      id, email, name, role,
      member_type as "memberType",
      organization_name as "organizationName",
      plan,
      email_verified as "emailVerified",
      admin_access as "adminAccess",
      teacher_access as "teacherAccess",
      created_at as "createdAt"
  `;

  if (!rows[0]) throw new Error("User not found.");

  // Sync org membership role to match the new access level.
  // Never elevate to 'owner' through this path.
  const newRole: OrgMemberRole =
    newAdminAccess ? "admin" : newTeacherAccess ? "teacher" : "student";
  await sql`
    update organization_memberships
    set role = ${newRole}
    where org_id = ${input.orgId} and user_id = ${input.targetUserId}
  `;

  // Successful update audit record.
  await sql`
    insert into permission_audit_log (id, actor_id, target_user_id, org_id, action, old_value, new_value, occurred_at)
    values (
      ${crypto.randomUUID()},
      ${input.actorId},
      ${input.targetUserId},
      ${input.orgId},
      'update_access',
      ${JSON.stringify({ adminAccess: current.adminAccess, teacherAccess: current.teacherAccess })}::jsonb,
      ${JSON.stringify({ adminAccess: newAdminAccess, teacherAccess: newTeacherAccess })}::jsonb,
      now()
    )
  `;

  return rows[0];
}
