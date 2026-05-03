import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/server/db";
import { getInstitutionAnalytics, listTeacherClasses } from "@/lib/classroom-store";
import { listTeacherHomework } from "@/lib/homework-store";
import { getMember, getProgressSummary } from "@/lib/store";
import {
  InstitutionUserSummary,
  MemberProfile,
  OrgInvite,
  OrgMembership,
  OrgMemberRole,
  Organization,
  TeacherClass,
  TeacherNote,
} from "@/lib/types";

type SchoolTeacherSummary = {
  teacher: MemberProfile;
  classCount: number;
  studentCount: number;
  activeStudents: number;
  averageScore: number;
  pendingApprovalCount: number;
  atRiskStudentCount: number;
  homeworkCompletionRate: number;
  homeworkAssignedCount: number;
  overdueHomeworkCount: number;
  recentActivityAt: string | null;
  mostCommonWeakestSkill: string | null;
};

type SchoolStudentSummary = {
  id: string;
  name: string;
  email: string;
  plan: string;
  classCount: number;
  sessionCount: number;
  averageScore: number | null;
  lastSessionAt: string | null;
  teacherNames: string[];
  homeworkCompletionRate: number;
  riskFlag: string | null;
};

type SchoolClassSummary = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  joinCode: string;
  studentCount: number;
  activeStudents: number;
  averageScore: number;
  pendingApprovals: number;
  homeworkAssignedCount: number;
  overdueHomeworkCount: number;
  lastActivityAt: string | null;
};

type SchoolTeacherDetail = {
  teacher: MemberProfile;
  summary: SchoolTeacherSummary;
  classes: SchoolClassSummary[];
  recentAnnouncements: Array<{ id: string; title: string; createdAt: string }>;
  recentNotes: TeacherNote[];
};

type SchoolStudentDetail = {
  student: MemberProfile;
  summary: Awaited<ReturnType<typeof getProgressSummary>>;
  overview: {
    totalSessions: number;
    averageScore: number;
    bestScore: number | null;
    weakestSkill: string | null;
    lastSessionTitle: string | null;
    lastExamType?: string | null;
    lastTaskType?: string | null;
    scoreDelta?: number | null;
    lastActiveAt?: string | null;
    riskFlags?: string[];
  };
  classes: Array<{ classId: string; className: string; teacherId: string; teacherName: string; joinedAt: string | null }>;
  homework: {
    total: number;
    completed: number;
    overdue: number;
  };
  notes: TeacherNote[];
};

type OrgSummary = {
  totalTeachers: number;
  totalClasses: number;
  totalStudents: number;
  activeStudents: number;
  pendingApprovals: number;
  atRiskStudents: number;
  averageScore: number;
  teacherSummaries: SchoolTeacherSummary[];
  classSummaries: SchoolClassSummary[];
  alerts: string[];
};

const ROLE_ORDER: Record<OrgMemberRole, number> = {
  student: 0,
  teacher: 1,
  admin: 2,
  owner: 3,
};

function buildSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || `org-${randomBytes(3).toString("hex")}`;
}

function buildInviteCode() {
  return randomBytes(16).toString("hex");
}

function toOrganization(row: {
  id: string;
  name: string;
  ownerId: string;
  slug?: string | null;
  createdAt: string;
}): Organization {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.ownerId,
    joinCode: row.slug ?? row.id,
    createdAt: row.createdAt,
  };
}

function upgradeRole(current: OrgMemberRole, next: OrgMemberRole): OrgMemberRole {
  return ROLE_ORDER[next] > ROLE_ORDER[current] ? next : current;
}

function buildRiskFlags(summary: Awaited<ReturnType<typeof getProgressSummary>>) {
  const flags: string[] = [];
  const latest = summary.recentSessions[0];
  if (!latest) return flags;
  const lastActiveDays = Math.floor((Date.now() - new Date(latest.createdAt).getTime()) / 86400000);
  if (lastActiveDays >= 7) flags.push("Inactive 7d");
  const scored = summary.recentSessions.filter((session) => session.report);
  if (scored.length >= 2) {
    const delta = (scored[0]?.report?.overall ?? 0) - (scored[scored.length - 1]?.report?.overall ?? 0);
    if (delta <= -0.8) flags.push("Falling score");
  }
  if (summary.averageScore > 0 && summary.averageScore < 5.5) flags.push("Low avg");
  return flags;
}

function findWeakestSkill(summary: Awaited<ReturnType<typeof getProgressSummary>>) {
  const buckets = new Map<string, { total: number; count: number }>();
  summary.recentSessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, { total: current.total + category.score, count: current.count + 1 });
    });
  });
  if (!buckets.size) return null;
  return [...buckets.entries()]
    .map(([label, stats]) => ({ label, average: stats.total / stats.count }))
    .sort((a, b) => a.average - b.average)[0]?.label ?? null;
}

function buildStudentOverview(student: MemberProfile, summary: Awaited<ReturnType<typeof getProgressSummary>>) {
  const scoredSessions = summary.recentSessions.filter((session) => session.report);
  const bestScore = scoredSessions.length ? Math.max(...scoredSessions.map((session) => session.report?.overall ?? 0)) : null;
  const latestScored = scoredSessions[0];
  const baselineScored = scoredSessions[scoredSessions.length - 1];
  const scoreDelta =
    latestScored?.report && baselineScored?.report && latestScored.id !== baselineScored.id
      ? Number((latestScored.report.overall - baselineScored.report.overall).toFixed(1))
      : null;

  return {
    totalSessions: summary.totalSessions,
    averageScore: summary.averageScore,
    bestScore,
    weakestSkill: findWeakestSkill(summary),
    lastSessionTitle: summary.recentSessions[0]?.prompt.title ?? null,
    lastExamType: summary.recentSessions[0]?.examType ?? null,
    lastTaskType: summary.recentSessions[0]?.taskType ?? null,
    scoreDelta,
    lastActiveAt: summary.recentSessions[0]?.createdAt ?? null,
    riskFlags: buildRiskFlags(summary),
    student,
  };
}

async function getTeacherMember(teacherId: string) {
  const member = await getMember(teacherId);
  if (!member) {
    throw new Error("Teacher not found.");
  }
  return member;
}

async function getTeacherClassMap(teacherId: string) {
  const classes = await listTeacherClasses(teacherId);
  return new Map(classes.map((item) => [item.id, item]));
}

async function buildTeacherSummary(orgId: string, teacher: MemberProfile): Promise<SchoolTeacherSummary> {
  void orgId;
  const [classes, analytics, homework] = await Promise.all([
    listTeacherClasses(teacher.id),
    getInstitutionAnalytics(teacher.id),
    listTeacherHomework(teacher.id),
  ]);
  const recentActivityCandidates = [
    ...classes.map((item) => item.createdAt),
    ...homework.map((item) => item.assignment.createdAt),
    ...homework.map((item) => item.assignment.completedAt).filter(Boolean) as string[],
  ].sort().reverse();
  return {
    teacher,
    classCount: classes.length,
    studentCount: analytics.totalStudents,
    activeStudents: analytics.activeStudents,
    averageScore: analytics.averageScore,
    pendingApprovalCount: analytics.pendingApprovalCount,
    atRiskStudentCount: analytics.atRiskStudentCount,
    homeworkCompletionRate: analytics.homeworkCompletionRate,
    homeworkAssignedCount: homework.length,
    overdueHomeworkCount: homework.filter((item) => !item.assignment.completedAt && item.assignment.dueAt && new Date(item.assignment.dueAt).getTime() < Date.now()).length,
    recentActivityAt: recentActivityCandidates[0] ?? null,
    mostCommonWeakestSkill: analytics.mostCommonWeakestSkill,
  };
}

async function buildClassSummary(classroom: TeacherClass, teacherName: string): Promise<SchoolClassSummary> {
  const sql = getSql();
  const [counts] = await sql<Array<{
    studentCount: number;
    pendingApprovals: number;
    activeStudents: number;
    averageScore: number | null;
    lastActivityAt: string | null;
  }>>`
    select
      count(distinct case when e.status = 'approved' then e.student_id end)::int as "studentCount",
      count(distinct case when e.status = 'pending' then e.student_id end)::int as "pendingApprovals",
      count(distinct case when s.id is not null then e.student_id end)::int as "activeStudents",
      round(avg(s.report_overall)::numeric, 1) as "averageScore",
      max(coalesce(s.created_at, e.joined_at, e.requested_at))::text as "lastActivityAt"
    from teacher_class_enrollments e
    left join speaking_sessions s on s.user_id = e.student_id and s.report_overall is not null
    where e.class_id = ${classroom.id}
  `;
  const [homeworkRow] = await sql<Array<{ total: number; overdue: number }>>`
    select
      count(*)::int as total,
      count(*) filter (where completed_at is null and due_at is not null and due_at < now())::int as overdue
    from homework_assignments
    where class_id = ${classroom.id}
  `;
  return {
    id: classroom.id,
    name: classroom.name,
    teacherId: classroom.teacherId,
    teacherName,
    joinCode: classroom.joinCode,
    studentCount: counts?.studentCount ?? 0,
    activeStudents: counts?.activeStudents ?? 0,
    averageScore: counts?.averageScore ?? 0,
    pendingApprovals: counts?.pendingApprovals ?? 0,
    homeworkAssignedCount: homeworkRow?.total ?? 0,
    overdueHomeworkCount: homeworkRow?.overdue ?? 0,
    lastActivityAt: counts?.lastActivityAt ?? null,
  };
}

export async function createOrganization(input: { name: string; ownerId: string }): Promise<Organization> {
  const sql = getSql();
  const id = crypto.randomUUID();
  const slug = buildSlug(input.name);
  const createdAt = new Date().toISOString();
  const rows = await sql<Array<{ id: string; name: string; slug: string | null; ownerId: string; createdAt: string }>>`
    insert into organizations (id, name, slug, owner_id, created_at)
    values (${id}, ${input.name.trim()}, ${slug}, ${input.ownerId}, ${createdAt})
    returning id, name, slug, owner_id as "ownerId", created_at as "createdAt"
  `;
  await addOrgMember({ orgId: id, userId: input.ownerId, role: "owner", invitedBy: input.ownerId });
  await sql`update users set organization_id = ${id} where id = ${input.ownerId}`;
  return toOrganization(rows[0]);
}

export async function getOrganizationByOwnerId(ownerId: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Array<{ id: string; name: string; slug: string | null; ownerId: string; createdAt: string }>>`
    select id, name, slug, owner_id as "ownerId", created_at as "createdAt"
    from organizations
    where owner_id = ${ownerId}
    limit 1
  `;
  return rows[0] ? toOrganization(rows[0]) : null;
}

export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Array<{ id: string; name: string; slug: string | null; ownerId: string; createdAt: string }>>`
    select id, name, slug, owner_id as "ownerId", created_at as "createdAt"
    from organizations
    where id = ${orgId}
    limit 1
  `;
  return rows[0] ? toOrganization(rows[0]) : null;
}

export async function getOrganizationByJoinCode(joinCode: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Array<{ id: string; name: string; slug: string | null; ownerId: string; createdAt: string }>>`
    select id, name, slug, owner_id as "ownerId", created_at as "createdAt"
    from organizations
    where lower(slug) = lower(${joinCode.trim()})
       or lower(id) = lower(${joinCode.trim()})
    limit 1
  `;
  return rows[0] ? toOrganization(rows[0]) : null;
}

/** Returns the organization for which the given user is an owner or admin. */
export async function getOrgForAdmin(userId: string): Promise<Organization | null> {
  const sql = getSql();
  const rows = await sql<Array<{ id: string; name: string; slug: string | null; ownerId: string; createdAt: string }>>`
    select o.id, o.name, o.slug, o.owner_id as "ownerId", o.created_at as "createdAt"
    from organizations o
    join organization_memberships m on m.organization_id = o.id
    where m.user_id = ${userId}
      and m.role in ('owner', 'admin')
    order by o.created_at asc
    limit 1
  `;
  return rows[0] ? toOrganization(rows[0]) : null;
}

export async function addOrgMember(input: {
  orgId: string;
  userId: string;
  role: OrgMemberRole;
  invitedBy?: string;
}): Promise<OrgMembership> {
  const sql = getSql();
  const existing = await getOrgMembership(input.orgId, input.userId);
  const nextRole = existing ? upgradeRole(existing.role, input.role) : input.role;
  const rows = await sql<OrgMembership[]>`
    insert into organization_memberships (id, organization_id, user_id, role, added_by, joined_at)
    values (${crypto.randomUUID()}, ${input.orgId}, ${input.userId}, ${nextRole}, ${input.invitedBy ?? null}, now())
    on conflict (organization_id, user_id)
    do update set
      role = ${nextRole},
      added_by = coalesce(organization_memberships.added_by, excluded.added_by)
    returning
      id,
      organization_id as "orgId",
      user_id as "userId",
      role,
      added_by as "invitedBy",
      joined_at as "joinedAt"
  `;
  if (nextRole !== "student") {
    await sql`
      update users
      set organization_id = ${input.orgId}
      where id = ${input.userId} and (organization_id is null or organization_id = ${input.orgId})
    `;
  }
  return rows[0];
}

export async function getOrgMembership(orgId: string, userId: string): Promise<OrgMembership | null> {
  const sql = getSql();
  const rows = await sql<OrgMembership[]>`
    select
      id,
      organization_id as "orgId",
      user_id as "userId",
      role,
      added_by as "invitedBy",
      joined_at as "joinedAt"
    from organization_memberships
    where organization_id = ${orgId} and user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function createOrgInvite(input: {
  orgId: string;
  role: Exclude<OrgMemberRole, "owner">;
  email?: string;
  createdBy: string;
  expiresInDays?: number;
}): Promise<OrgInvite> {
  const sql = getSql();
  const inviteCode = buildInviteCode();
  const rows = await sql<OrgInvite[]>`
    insert into organization_invites (id, organization_id, invited_by, email, role, token_hash, expires_at, created_at)
    values (
      ${crypto.randomUUID()},
      ${input.orgId},
      ${input.createdBy},
      ${input.email?.trim().toLowerCase() ?? null},
      ${input.role},
      ${inviteCode},
      ${new Date(Date.now() + (input.expiresInDays ?? 7) * 86400000).toISOString()},
      now()
    )
    returning
      id,
      organization_id as "orgId",
      email,
      role,
      token_hash as "inviteCode",
      invited_by as "createdBy",
      expires_at as "expiresAt",
      accepted_at as "usedAt",
      null::text as "usedBy",
      created_at as "createdAt"
  `;
  return rows[0];
}

export async function listOrgInvites(orgId: string): Promise<OrgInvite[]> {
  const sql = getSql();
  return sql<OrgInvite[]>`
    select
      id,
      organization_id as "orgId",
      email,
      role,
      token_hash as "inviteCode",
      invited_by as "createdBy",
      expires_at as "expiresAt",
      accepted_at as "usedAt",
      null::text as "usedBy",
      created_at as "createdAt"
    from organization_invites
    where organization_id = ${orgId}
      and accepted_at is null
      and expires_at > now()
    order by created_at desc
  `;
}

export async function consumeOrgInvite(input: {
  inviteCode: string;
  userId: string;
  userEmail: string;
}): Promise<{ org: Organization; role: Exclude<OrgMemberRole, "owner"> } | null> {
  const sql = getSql();
  const rows = await sql<Array<{
    id: string;
    orgId: string;
    email: string | null;
    role: Exclude<OrgMemberRole, "owner">;
    createdBy: string;
    orgName: string;
    orgOwnerId: string;
    orgSlug: string | null;
    orgCreatedAt: string;
  }>>`
    select
      i.id,
      i.organization_id as "orgId",
      i.email,
      i.role,
      i.invited_by as "createdBy",
      o.name as "orgName",
      o.owner_id as "orgOwnerId",
      o.slug as "orgSlug",
      o.created_at as "orgCreatedAt"
    from organization_invites i
    join organizations o on o.id = i.organization_id
    where i.token_hash = ${input.inviteCode}
      and i.accepted_at is null
      and i.expires_at > now()
      and (i.email is null or lower(i.email) = lower(${input.userEmail}))
    limit 1
  `;
  const invite = rows[0];
  if (!invite) return null;

  await sql`
    update organization_invites
    set accepted_at = now()
    where id = ${invite.id}
  `;

  await addOrgMember({
    orgId: invite.orgId,
    userId: input.userId,
    role: invite.role,
    invitedBy: invite.createdBy,
  });

  if (invite.role === "admin") {
    await sql`update users set teacher_access = true, admin_access = true, organization_id = ${invite.orgId} where id = ${input.userId}`;
  } else if (invite.role === "teacher") {
    await sql`update users set teacher_access = true, organization_id = coalesce(organization_id, ${invite.orgId}) where id = ${input.userId}`;
  }

  return {
    org: toOrganization({
      id: invite.orgId,
      name: invite.orgName,
      ownerId: invite.orgOwnerId,
      slug: invite.orgSlug,
      createdAt: invite.orgCreatedAt,
    }),
    role: invite.role,
  };
}

export async function listOrgUsers(orgId: string, search?: string): Promise<InstitutionUserSummary[]> {
  const normalized = search?.trim().toLowerCase() ?? "";
  const sql = getSql();
  return sql<InstitutionUserSummary[]>`
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
      u.created_at as "createdAt"
    from users u
    join organization_memberships m on m.user_id = u.id
    where m.organization_id = ${orgId}
      and (
        ${normalized === ""}
        or lower(u.email) like ${"%" + normalized + "%"}
        or lower(u.name) like ${"%" + normalized + "%"}
      )
    order by u.created_at desc
    limit 300
  `;
}

export async function listOrgTeacherSummaries(orgId: string): Promise<SchoolTeacherSummary[]> {
  const sql = getSql();
  const teachers = await sql<MemberProfile[]>`
    select
      u.id,
      u.email,
      u.name,
      u.role,
      u.member_type as "memberType",
      u.organization_name as "organizationName",
      u.organization_id as "organizationId",
      u.plan,
      u.email_verified as "emailVerified",
      u.admin_access as "adminAccess",
      u.teacher_access as "teacherAccess",
      u.created_at as "createdAt"
    from users u
    join organization_memberships m on m.user_id = u.id
    where m.organization_id = ${orgId}
      and m.role in ('teacher', 'admin', 'owner')
    order by u.created_at asc
  `;
  const summaries = await Promise.all(teachers.map((teacher) => buildTeacherSummary(orgId, teacher)));
  return summaries.sort((a, b) => (b.studentCount - a.studentCount) || ((b.recentActivityAt ?? "").localeCompare(a.recentActivityAt ?? "")));
}

export async function listOrgClassSummaries(orgId: string): Promise<SchoolClassSummary[]> {
  const sql = getSql();
  const classes = await sql<Array<TeacherClass & { teacherName: string }>>`
    select
      c.id,
      c.teacher_id as "teacherId",
      c.name,
      c.join_code as "joinCode",
      c.approval_required as "approvalRequired",
      c.join_message as "joinMessage",
      c.created_at as "createdAt",
      u.name as "teacherName"
    from teacher_classes c
    join users u on u.id = c.teacher_id
    join organization_memberships m on m.user_id = c.teacher_id
    where m.organization_id = ${orgId}
      and m.role in ('teacher', 'admin', 'owner')
    order by c.created_at desc
  `;
  return Promise.all(classes.map((item) => buildClassSummary(item, item.teacherName)));
}

export async function listOrgStudentSummaries(orgId: string): Promise<SchoolStudentSummary[]> {
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
    completedHomework: number;
    totalHomework: number;
  }>>`
    select
      u.id,
      u.name,
      u.email,
      u.plan,
      count(distinct e.class_id)::int as "classCount",
      count(distinct s.id)::int as "sessionCount",
      round(avg(s.report_overall)::numeric, 1) as "averageScore",
      max(s.created_at)::text as "lastSessionAt",
      coalesce(array_agg(distinct t.name) filter (where t.name is not null), '{}'::text[]) as "teacherNames",
      count(distinct h.id) filter (where h.completed_at is not null)::int as "completedHomework",
      count(distinct h.id)::int as "totalHomework"
    from teacher_class_enrollments e
    join teacher_classes c on c.id = e.class_id
    join users t on t.id = c.teacher_id
    join organization_memberships tm on tm.user_id = t.id and tm.organization_id = ${orgId}
    join users u on u.id = e.student_id
    left join speaking_sessions s on s.user_id = u.id and s.report_overall is not null
    left join homework_assignments h on h.student_id = u.id and (h.class_id = c.id or h.class_id is null)
    where e.status = 'approved'
    group by u.id, u.name, u.email, u.plan
    order by "sessionCount" desc, u.created_at desc
    limit 400
  `;
  return rows.map((row) => {
    const lastActiveDays = row.lastSessionAt ? Math.floor((Date.now() - new Date(row.lastSessionAt).getTime()) / 86400000) : null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      plan: row.plan,
      classCount: row.classCount,
      sessionCount: row.sessionCount,
      averageScore: row.averageScore,
      lastSessionAt: row.lastSessionAt,
      teacherNames: Array.isArray(row.teacherNames) ? row.teacherNames : [],
      homeworkCompletionRate: row.totalHomework > 0 ? Math.round((row.completedHomework / row.totalHomework) * 100) : 0,
      riskFlag: lastActiveDays != null && lastActiveDays >= 7 ? "Inactive 7d" : (row.averageScore != null && row.averageScore < 5.5 ? "Low avg" : null),
    };
  });
}

export async function getOrgAdminSummary(orgId: string): Promise<OrgSummary> {
  const [teacherSummaries, classSummaries, students] = await Promise.all([
    listOrgTeacherSummaries(orgId),
    listOrgClassSummaries(orgId),
    listOrgStudentSummaries(orgId),
  ]);
  const totalTeachers = teacherSummaries.length;
  const totalClasses = classSummaries.length;
  const totalStudents = students.length;
  const activeStudents = students.filter((item) => Boolean(item.lastSessionAt)).length;
  const pendingApprovals = classSummaries.reduce((sum, item) => sum + item.pendingApprovals, 0);
  const atRiskStudents = students.filter((item) => item.riskFlag).length;
  const averageScore = students.length
    ? Number((students.reduce((sum, item) => sum + (item.averageScore ?? 0), 0) / students.filter((item) => item.averageScore != null).length || 0).toFixed(1))
    : 0;

  const alerts: string[] = [];
  if (teacherSummaries.length === 0) alerts.push("No teachers added yet.");
  if (classSummaries.length === 0) alerts.push("No classes created yet.");
  if (students.length === 0) alerts.push("No students connected to this institution yet.");
  teacherSummaries.forEach((item) => {
    if (item.pendingApprovalCount > 0) alerts.push(`${item.teacher.name}: ${item.pendingApprovalCount} pending approvals`);
    if (item.overdueHomeworkCount > 0) alerts.push(`${item.teacher.name}: ${item.overdueHomeworkCount} overdue homework items`);
  });

  return {
    totalTeachers,
    totalClasses,
    totalStudents,
    activeStudents,
    pendingApprovals,
    atRiskStudents,
    averageScore,
    teacherSummaries,
    classSummaries,
    alerts: alerts.slice(0, 10),
  };
}

export async function getOrgTeacherDetail(orgId: string, teacherId: string): Promise<SchoolTeacherDetail> {
  const teacherSummary = (await listOrgTeacherSummaries(orgId)).find((item) => item.teacher.id === teacherId);
  if (!teacherSummary) throw Object.assign(new Error("Teacher not found in your organization."), { statusCode: 404 });
  const classes = (await listOrgClassSummaries(orgId)).filter((item) => item.teacherId === teacherId);
  const sql = getSql();
  const [recentAnnouncements, notes] = await Promise.all([
    sql<Array<{ id: string; title: string; createdAt: string }>>`
      select id, title, created_at as "createdAt"
      from announcements
      where author_id = ${teacherId}
      order by created_at desc
      limit 6
    `,
    sql<TeacherNote[]>`
      select
        n.id,
        n.teacher_id as "teacherId",
        n.student_id as "studentId",
        n.session_id as "sessionId",
        n.note,
        n.tags_json as "tags",
        n.created_at as "createdAt"
      from teacher_notes n
      where n.teacher_id = ${teacherId}
      order by n.created_at desc
      limit 12
    `,
  ]);
  return {
    teacher: teacherSummary.teacher,
    summary: teacherSummary,
    classes,
    recentAnnouncements,
    recentNotes: notes,
  };
}

export async function getOrgStudentDetail(orgId: string, studentId: string): Promise<SchoolStudentDetail> {
  const sql = getSql();
  const classes = await sql<Array<{ classId: string; className: string; teacherId: string; teacherName: string; joinedAt: string | null }>>`
    select
      c.id as "classId",
      c.name as "className",
      c.teacher_id as "teacherId",
      t.name as "teacherName",
      e.joined_at::text as "joinedAt"
    from teacher_class_enrollments e
    join teacher_classes c on c.id = e.class_id
    join users t on t.id = c.teacher_id
    join organization_memberships m on m.user_id = c.teacher_id
    where e.student_id = ${studentId}
      and e.status = 'approved'
      and m.organization_id = ${orgId}
    order by e.joined_at desc nulls last
  `;
  if (!classes.length) {
    throw Object.assign(new Error("Student not found in your organization."), { statusCode: 404 });
  }
  const student = await getMember(studentId);
  if (!student) throw Object.assign(new Error("Student not found."), { statusCode: 404 });
  const summary = await getProgressSummary(studentId);
  const overview = buildStudentOverview(student, summary);
  const homeworkRows = await sql<Array<{ completedAt: string | null; dueAt: string | null }>>`
    select completed_at as "completedAt", due_at as "dueAt"
    from homework_assignments
    where student_id = ${studentId}
      and teacher_id = any(${classes.map((item) => item.teacherId)})
  `;
  const notes = await sql<TeacherNote[]>`
    select
      n.id,
      n.teacher_id as "teacherId",
      n.student_id as "studentId",
      n.session_id as "sessionId",
      n.note,
      n.tags_json as "tags",
      n.created_at as "createdAt"
    from teacher_notes n
    join organization_memberships m on m.user_id = n.teacher_id
    where n.student_id = ${studentId}
      and m.organization_id = ${orgId}
    order by n.created_at desc
    limit 24
  `;
  return {
    student,
    summary,
    overview,
    classes,
    homework: {
      total: homeworkRows.length,
      completed: homeworkRows.filter((item) => item.completedAt).length,
      overdue: homeworkRows.filter((item) => !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() < Date.now()).length,
    },
    notes,
  };
}

export async function updateOrgUserAccess(input: {
  actorId: string;
  orgId: string;
  targetUserId: string;
  teacherAccess?: boolean;
  adminAccess?: boolean;
}): Promise<InstitutionUserSummary> {
  const sql = getSql();
  const [actorMembership, targetMembership, currentRows] = await Promise.all([
    getOrgMembership(input.orgId, input.actorId),
    getOrgMembership(input.orgId, input.targetUserId),
    sql<Array<{ adminAccess: boolean; teacherAccess: boolean }>>`
      select admin_access as "adminAccess", teacher_access as "teacherAccess"
      from users where id = ${input.targetUserId} limit 1
    `,
  ]);
  const current = currentRows[0] ?? { adminAccess: false, teacherAccess: false };

  async function logAudit(blocked: boolean, reason?: string, next?: { adminAccess: boolean; teacherAccess: boolean }) {
    await sql`
      insert into permission_audit_log (
        id, organization_id, actor_id, target_user_id, action,
        old_value_json, new_value_json, blocked, block_reason, occurred_at
      ) values (
        ${crypto.randomUUID()},
        ${input.orgId},
        ${input.actorId},
        ${input.targetUserId},
        'update_access',
        ${JSON.stringify(current)},
        ${JSON.stringify(next ?? { adminAccess: input.adminAccess, teacherAccess: input.teacherAccess })},
        ${blocked},
        ${reason ?? null},
        now()
      )
    `;
  }

  if (!actorMembership || !["owner", "admin"].includes(actorMembership.role)) {
    await logAudit(true, "actor_not_authorized");
    throw Object.assign(new Error("You do not have permission to change access in this organization."), { statusCode: 403 });
  }
  if (!targetMembership) {
    await logAudit(true, "target_not_in_org");
    throw Object.assign(new Error("User does not belong to your organization."), { statusCode: 404 });
  }
  if (targetMembership.role === "owner") {
    await logAudit(true, "target_is_owner");
    throw Object.assign(new Error("The organization owner cannot be modified here."), { statusCode: 403 });
  }
  if (actorMembership.role === "admin" && targetMembership.role === "admin" && input.adminAccess === false) {
    await logAudit(true, "peer_admin_demotion_forbidden");
    throw Object.assign(new Error("Only the organization owner can demote another admin."), { statusCode: 403 });
  }

  const nextAdmin = input.adminAccess ?? current.adminAccess;
  const nextTeacher = input.teacherAccess ?? current.teacherAccess;
  const rows = await sql<InstitutionUserSummary[]>`
    update users
    set
      teacher_access = ${nextTeacher},
      admin_access = ${nextAdmin}
    where id = ${input.targetUserId}
    returning
      id,
      email,
      name,
      role,
      member_type as "memberType",
      organization_name as "organizationName",
      plan,
      email_verified as "emailVerified",
      admin_access as "adminAccess",
      teacher_access as "teacherAccess",
      created_at as "createdAt"
  `;
  const nextRole: OrgMemberRole = nextAdmin ? "admin" : nextTeacher ? "teacher" : "student";
  await sql`
    update organization_memberships
    set role = ${nextRole}
    where organization_id = ${input.orgId} and user_id = ${input.targetUserId} and role <> 'owner'
  `;
  await logAudit(false, undefined, { adminAccess: nextAdmin, teacherAccess: nextTeacher });
  return rows[0];
}
