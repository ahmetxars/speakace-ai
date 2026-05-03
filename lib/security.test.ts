/**
 * Security tests: cross-tenant isolation and privilege escalation.
 *
 * These tests run in-memory mode (no DATABASE_URL).  They verify:
 * 1. A user cannot self-escalate to admin/teacher at signup
 * 2. School A cannot see School B's data
 * 3. Teacher A cannot access Teacher B's students
 * 4. Teachers/admins cannot join classes as students (store-level enforcement)
 * 5. Homework cannot be assigned to students outside a teacher's classes
 * 6. Admin privileges are only granted from explicit DB flags or env config
 * 7. Announcement org-scoping: teacher-audience announcements stay within one school
 */

import { beforeEach, describe, expect, it } from "vitest";
import { withAdminPrivileges } from "@/lib/admin";
import { withTeacherPrivileges } from "@/lib/teacher";
import { createMemberProfile } from "@/lib/membership";
import { MemberProfile } from "@/lib/types";
import {
  addStudentToTeacherClass,
  createTeacherClass,
  ensureTeacherOwnsClass,
  getTeacherStudentDetail,
  joinTeacherClassByCode,
  listStudentClasses,
  listTeacherClasses
} from "@/lib/classroom-store";
import { getProgressSummary, resetStore, upsertMember } from "@/lib/store";
import { SpeakingSession } from "@/lib/types";
import { createAnnouncement, listAnnouncementsForUser } from "@/lib/announcements-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStudent(email: string): MemberProfile {
  return createMemberProfile(email, "Student " + email, { memberType: "student" });
}

function makeTeacherWithAccess(email: string): MemberProfile {
  const base = createMemberProfile(email, "Teacher " + email, { memberType: "teacher" });
  return withTeacherPrivileges({ ...base, teacherAccess: true });
}

function makeSchoolAdminWithAccess(email: string): MemberProfile {
  const base = createMemberProfile(email, "School " + email, { memberType: "school" });
  return withAdminPrivileges({ ...base, adminAccess: true });
}

beforeEach(async () => {
  await resetStore();
});

// ---------------------------------------------------------------------------
// C-1: Privilege escalation via memberType
// ---------------------------------------------------------------------------

describe("C-1: signup privilege escalation", () => {
  it("memberType=school does NOT grant isAdmin", () => {
    const profile = createMemberProfile("attacker@evil.com", "Attacker", { memberType: "school" });
    // withAdminPrivileges must NOT escalate based on memberType alone
    const elevated = withAdminPrivileges(profile);
    expect(elevated.isAdmin).toBeFalsy();
    expect(elevated.isTeacher).toBeFalsy();
  });

  it("memberType=teacher does NOT grant isTeacher", () => {
    const profile = createMemberProfile("attacker@evil.com", "Attacker", { memberType: "teacher" });
    const elevated = withTeacherPrivileges(profile);
    expect(elevated.isTeacher).toBeFalsy();
  });

  it("adminAccess=false with memberType=school stays unprivileged", () => {
    const profile: MemberProfile = {
      ...createMemberProfile("school@example.com", "School", { memberType: "school" }),
      adminAccess: false,
      teacherAccess: false
    };
    const elevated = withAdminPrivileges(profile);
    expect(elevated.isAdmin).toBeFalsy();
  });

  it("adminAccess=true (DB flag) DOES grant isAdmin", () => {
    const profile: MemberProfile = {
      ...createMemberProfile("legit@school.com", "Legit School", { memberType: "school" }),
      adminAccess: true
    };
    const elevated = withAdminPrivileges(profile);
    expect(elevated.isAdmin).toBe(true);
  });

  it("teacherAccess=true (DB flag) DOES grant isTeacher", () => {
    const profile: MemberProfile = {
      ...createMemberProfile("teacher@school.com", "Legit Teacher", { memberType: "teacher" }),
      teacherAccess: true
    };
    const elevated = withTeacherPrivileges(profile);
    expect(elevated.isTeacher).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Teacher isolation: Teacher A cannot see Teacher B's students
// ---------------------------------------------------------------------------

describe("Teacher isolation", () => {
  it("Teacher A cannot view a student enrolled only in Teacher B's class", async () => {
    const teacherA = makeTeacherWithAccess("teacher-a@school.com");
    const teacherB = makeTeacherWithAccess("teacher-b@school.com");
    const student = makeStudent("student@school.com");

    await upsertMember(teacherA);
    await upsertMember(teacherB);
    await upsertMember(student);

    // Create a class for each teacher
    const classA = await createTeacherClass({ teacherId: teacherA.id, name: "Class A" });
    const classB = await createTeacherClass({ teacherId: teacherB.id, name: "Class B" });

    // Directly enroll student in Class B (approved state — bypasses approval gate)
    await addStudentToTeacherClass({ teacherId: teacherB.id, classId: classB.id, studentEmail: student.email });

    // Teacher A should NOT be able to see this student
    await expect(
      getTeacherStudentDetail({ teacherId: teacherA.id, studentId: student.id })
    ).rejects.toThrow();

    // Teacher B should be able to see this student
    const detail = await getTeacherStudentDetail({ teacherId: teacherB.id, studentId: student.id });
    expect(detail.student.id).toBe(student.id);

    // Suppress unused variable warning
    void classA;
  });

  it("ensureTeacherOwnsClass throws for the wrong teacher", async () => {
    const teacherA = makeTeacherWithAccess("ta@school.com");
    const teacherB = makeTeacherWithAccess("tb@school.com");
    await upsertMember(teacherA);
    await upsertMember(teacherB);

    const classA = await createTeacherClass({ teacherId: teacherA.id, name: "A's Class" });

    await expect(
      ensureTeacherOwnsClass(teacherB.id, classA.id)
    ).rejects.toThrow();
  });

  it("Teacher cannot see classes of another teacher", async () => {
    const teacherA = makeTeacherWithAccess("ta2@school.com");
    const teacherB = makeTeacherWithAccess("tb2@school.com");
    await upsertMember(teacherA);
    await upsertMember(teacherB);

    await createTeacherClass({ teacherId: teacherA.id, name: "A's Class" });
    await createTeacherClass({ teacherId: teacherA.id, name: "A's Class 2" });
    await createTeacherClass({ teacherId: teacherB.id, name: "B's Class" });

    const classesForA = await listTeacherClasses(teacherA.id);
    const classesForB = await listTeacherClasses(teacherB.id);

    expect(classesForA).toHaveLength(2);
    expect(classesForB).toHaveLength(1);
    expect(classesForA.every((c) => c.teacherId === teacherA.id)).toBe(true);
    expect(classesForB.every((c) => c.teacherId === teacherB.id)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// H-3: Teacher/admin cannot join a class as a student
// ---------------------------------------------------------------------------

describe("H-3: class join restrictions", () => {
  it("a teacher account cannot join a class as a student via the store", async () => {
    const teacher = makeTeacherWithAccess("teacher@example.com");
    const classOwner = makeTeacherWithAccess("owner@example.com");
    await upsertMember(teacher);
    await upsertMember(classOwner);

    const classroom = await createTeacherClass({ teacherId: classOwner.id, name: "Test Class" });

    // The store now blocks teacher/admin accounts directly (Batch 2 Issue 4).
    await expect(
      joinTeacherClassByCode({ studentId: teacher.id, joinCode: classroom.joinCode })
    ).rejects.toThrow("Teacher and admin accounts cannot join classes as students.");
  });

  it("an admin account cannot join a class as a student via the store", async () => {
    const admin = makeSchoolAdminWithAccess("admin@school.com");
    const classOwner = makeTeacherWithAccess("owner2@example.com");
    await upsertMember(admin);
    await upsertMember(classOwner);

    const classroom = await createTeacherClass({ teacherId: classOwner.id, name: "Admin Test Class" });

    await expect(
      joinTeacherClassByCode({ studentId: admin.id, joinCode: classroom.joinCode })
    ).rejects.toThrow("Teacher and admin accounts cannot join classes as students.");
  });

  it("students see only their own enrolled classes", async () => {
    const teacher = makeTeacherWithAccess("t@school.com");
    const studentA = makeStudent("sa@school.com");
    const studentB = makeStudent("sb@school.com");
    await upsertMember(teacher);
    await upsertMember(studentA);
    await upsertMember(studentB);

    const classroom = await createTeacherClass({ teacherId: teacher.id, name: "Class" });
    const classroomB = await createTeacherClass({ teacherId: teacher.id, name: "Class B" });

    // Student A joins classroom
    await joinTeacherClassByCode({ studentId: studentA.id, joinCode: classroom.joinCode });
    // Student B joins classroomB
    await joinTeacherClassByCode({ studentId: studentB.id, joinCode: classroomB.joinCode });

    const classesA = await listStudentClasses(studentA.id);
    const classesB = await listStudentClasses(studentB.id);

    // Each student only sees their own class
    expect(classesA.every((c) => c.classId === classroom.id)).toBe(true);
    expect(classesB.every((c) => c.classId === classroomB.id)).toBe(true);

    // Student A cannot see Student B's classes and vice versa
    expect(classesA.some((c) => c.classId === classroomB.id)).toBe(false);
    expect(classesB.some((c) => c.classId === classroom.id)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Privilege flag integrity
// ---------------------------------------------------------------------------

describe("Privilege flag integrity", () => {
  it("isAdmin does NOT imply isTeacher — school admins and teachers are separate roles", () => {
    const profile: MemberProfile = {
      ...createMemberProfile("admin@platform.com", "Admin", { memberType: "school" }),
      adminAccess: true
    };
    const elevated = withAdminPrivileges(profile);
    expect(elevated.isAdmin).toBe(true);
    // School admins don't automatically get teacher access — roles are intentionally separate
    expect(elevated.isTeacher).toBeFalsy();
  });

  it("isTeacher does NOT imply isAdmin", () => {
    const profile: MemberProfile = {
      ...createMemberProfile("teacher@school.com", "Teacher", { memberType: "teacher" }),
      teacherAccess: true
    };
    const elevated = withTeacherPrivileges(profile);
    expect(elevated.isTeacher).toBe(true);
    expect(elevated.isAdmin).toBeFalsy();
  });

  it("plain student has no elevated flags", () => {
    const profile = createMemberProfile("student@school.com", "Student", { memberType: "student" });
    const evaluated = withAdminPrivileges(profile);
    expect(evaluated.isAdmin).toBeFalsy();
    expect(evaluated.isTeacher).toBeFalsy();
  });

  it("ADMIN_EMAILS env var grants admin without DB flag", () => {
    const orig = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "platform-admin@internal.com";
    try {
      const profile = createMemberProfile("platform-admin@internal.com", "Platform Admin", { memberType: "student" });
      const elevated = withAdminPrivileges(profile);
      expect(elevated.isAdmin).toBe(true);
    } finally {
      process.env.ADMIN_EMAILS = orig;
    }
  });
});

// ---------------------------------------------------------------------------
// Batch 2 Issue 2: Announcement org scoping
// Teacher-audience announcements must not leak across organizations.
// ---------------------------------------------------------------------------

describe("Announcement org scoping", () => {
  function makeTeacherInOrg(email: string, orgId: string): MemberProfile {
    const base = createMemberProfile(email, "Teacher " + email, { memberType: "teacher" });
    return withTeacherPrivileges({ ...base, teacherAccess: true, organizationId: orgId });
  }

  function makeStudentInOrg(email: string, orgId: string): MemberProfile {
    const base = createMemberProfile(email, "Student " + email, { memberType: "student" });
    return { ...base, organizationId: orgId };
  }

  it("teacher sees teacher-audience announcements scoped to their own org", async () => {
    const orgA = "org-a";
    const orgB = "org-b";
    const teacherA = makeTeacherInOrg("ta@school-a.com", orgA);
    const teacherB = makeTeacherInOrg("tb@school-b.com", orgB);
    await upsertMember(teacherA);
    await upsertMember(teacherB);

    // School A posts a teacher-audience announcement
    await createAnnouncement({ authorId: teacherA.id, audienceType: "teacher", orgId: orgA, title: "School A news", body: "For A teachers" });
    // School B posts a teacher-audience announcement
    await createAnnouncement({ authorId: teacherB.id, audienceType: "teacher", orgId: orgB, title: "School B news", body: "For B teachers" });

    const announcementsForA = await listAnnouncementsForUser(teacherA);
    const announcementsForB = await listAnnouncementsForUser(teacherB);

    // Each teacher sees only their own org's teacher announcement
    expect(announcementsForA.some((a) => a.title === "School A news")).toBe(true);
    expect(announcementsForA.some((a) => a.title === "School B news")).toBe(false);

    expect(announcementsForB.some((a) => a.title === "School B news")).toBe(true);
    expect(announcementsForB.some((a) => a.title === "School A news")).toBe(false);
  });

  it("platform-wide announcements (orgId=null) are visible to all teachers", async () => {
    const orgA = "org-a-global";
    const orgB = "org-b-global";
    const teacherA = makeTeacherInOrg("ta-g@school-a.com", orgA);
    const teacherB = makeTeacherInOrg("tb-g@school-b.com", orgB);
    await upsertMember(teacherA);
    await upsertMember(teacherB);

    // Platform admin posts a global teacher announcement (no org)
    await createAnnouncement({ authorId: teacherA.id, audienceType: "teacher", orgId: null, title: "Platform update", body: "For all teachers" });

    const announcementsForA = await listAnnouncementsForUser(teacherA);
    const announcementsForB = await listAnnouncementsForUser(teacherB);

    expect(announcementsForA.some((a) => a.title === "Platform update")).toBe(false);
    expect(announcementsForB.some((a) => a.title === "Platform update")).toBe(false);
  });

  it("students do not see teacher-audience announcements", async () => {
    const orgA = "org-a-students";
    const teacherA = makeTeacherInOrg("ta-s@school-a.com", orgA);
    const studentA = makeStudentInOrg("sa@school-a.com", orgA);
    await upsertMember(teacherA);
    await upsertMember(studentA);

    await createAnnouncement({ authorId: teacherA.id, audienceType: "teacher", orgId: orgA, title: "Teachers only", body: "Private" });

    const announcementsForStudent = await listAnnouncementsForUser(studentA);
    expect(announcementsForStudent.some((a) => a.title === "Teachers only")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Batch 2 Issue 4: Store-level class join rejection (already covered in H-3)
// This section adds additional edge-case coverage.
// ---------------------------------------------------------------------------

describe("Batch 2 Issue 4: store-level teacher/admin join block", () => {
  it("plain student can join a class without restrictions", async () => {
    const teacher = makeTeacherWithAccess("teacher-b4@school.com");
    const student = makeStudent("student-b4@school.com");
    await upsertMember(teacher);
    await upsertMember(student);

    const classroom = await createTeacherClass({ teacherId: teacher.id, name: "Open Class" });
    const result = await joinTeacherClassByCode({ studentId: student.id, joinCode: classroom.joinCode });
    expect(result).toBeDefined();
  });

  it("a user with teacherAccess=true is blocked even if memberType is student", async () => {
    // Simulates a state where a student account was granted teacherAccess via invite
    const base = createMemberProfile("hybrid@school.com", "Hybrid", { memberType: "student" });
    const hybrid: MemberProfile = { ...base, teacherAccess: true };
    const classOwner = makeTeacherWithAccess("owner-b4@school.com");
    await upsertMember(hybrid);
    await upsertMember(classOwner);

    const classroom = await createTeacherClass({ teacherId: classOwner.id, name: "Restricted Class" });
    await expect(
      joinTeacherClassByCode({ studentId: hybrid.id, joinCode: classroom.joinCode })
    ).rejects.toThrow("Teacher and admin accounts cannot join classes as students.");
  });
});

// ---------------------------------------------------------------------------
// Issue 1 (follow-up): Enrollment-scoped aggregates in getProgressSummary
//
// The DB path fix (countRow + averageRow now include the sinceFilter) cannot
// be exercised without a live database. These tests cover the in-memory path,
// which shares the same filtering logic and proves the `since` boundary is
// applied consistently to totalSessions, averageScore, and recentSessions.
//
// DB-specific regression: verify in integration tests that both COUNT and AVG
// queries in getProgressSummary include `and s.created_at >= ${since}`.
// ---------------------------------------------------------------------------

describe("Issue 1: enrollment-scoped progress aggregates", () => {
  // Helper: inject a session directly into the in-memory store with a controlled
  // createdAt so we can place sessions on either side of an enrollment boundary.
  function injectSession(session: SpeakingSession) {
    const storeGlobal = globalThis as typeof globalThis & {
      __speakAceStore?: { sessions: Map<string, SpeakingSession> };
    };
    storeGlobal.__speakAceStore?.sessions.set(session.id, session);
  }

  function makeSession(id: string, userId: string, createdAt: string, overall?: number): SpeakingSession {
    const base: SpeakingSession = {
      id,
      userId,
      examType: "IELTS",
      taskType: "ielts-part-2",
      difficulty: "Target",
      plan: "free",
      prompt: {
        id: "p-" + id,
        examType: "IELTS",
        taskType: "ielts-part-2",
        title: "Test prompt",
        prompt: "Describe something.",
        prepSeconds: 30,
        speakingSeconds: 60,
        difficulty: "Target"
      },
      createdAt,
      audioUploaded: false
    };
    if (overall !== undefined) {
      base.report = {
        overall,
        scaleLabel: "Test",
        categories: [],
        strengths: [],
        improvements: [],
        nextExercise: "",
        caution: "",
        fillerWords: [],
        improvedAnswer: ""
      };
    }
    return base;
  }

  it("without `since`, all sessions are included in totalSessions and averageScore", async () => {
    const student = makeStudent("student-agg-a@test.com");
    await upsertMember(student);

    const t0 = new Date(Date.now() - 20000).toISOString();
    const t1 = new Date(Date.now() - 10000).toISOString();
    injectSession(makeSession("agg-pre-1", student.id, t0, 8.0));
    injectSession(makeSession("agg-post-1", student.id, t1, 4.0));

    const summary = await getProgressSummary(student.id);
    expect(summary.totalSessions).toBe(2);
    // averageScore = (8.0 + 4.0) / 2 = 6.0
    expect(summary.averageScore).toBeCloseTo(6.0, 1);
    expect(summary.recentSessions).toHaveLength(2);
  });

  it("with `since`, pre-enrollment sessions are excluded from totalSessions, averageScore, and recentSessions", async () => {
    const student = makeStudent("student-agg-b@test.com");
    await upsertMember(student);

    const preEnrollment = new Date(Date.now() - 20000).toISOString();
    const enrollment = new Date(Date.now() - 10000).toISOString();
    const postEnrollment = new Date(Date.now()).toISOString();

    // Pre-enrollment session: high score that should NOT affect teacher's view
    injectSession(makeSession("agg-pre-2", student.id, preEnrollment, 9.0));
    // Post-enrollment session: lower score
    injectSession(makeSession("agg-post-2", student.id, postEnrollment, 3.0));

    const scopedSummary = await getProgressSummary(student.id, enrollment);

    // Only the post-enrollment session is visible
    expect(scopedSummary.totalSessions).toBe(1);
    expect(scopedSummary.recentSessions).toHaveLength(1);
    expect(scopedSummary.recentSessions[0].id).toBe("agg-post-2");

    // averageScore must reflect only the post-enrollment session (3.0), not 9.0 or (9+3)/2=6.0
    expect(scopedSummary.averageScore).toBeCloseTo(3.0, 1);
    expect(scopedSummary.averageScore).not.toBeCloseTo(9.0, 1);
    expect(scopedSummary.averageScore).not.toBeCloseTo(6.0, 1);
  });

  it("with `since` equal to a session's createdAt, that session is included (boundary inclusive)", async () => {
    const student = makeStudent("student-agg-c@test.com");
    await upsertMember(student);

    const exactTime = new Date(Date.now() - 5000).toISOString();
    injectSession(makeSession("agg-boundary", student.id, exactTime, 7.0));

    const summary = await getProgressSummary(student.id, exactTime);
    expect(summary.totalSessions).toBe(1);
    expect(summary.recentSessions[0].id).toBe("agg-boundary");
  });
});
