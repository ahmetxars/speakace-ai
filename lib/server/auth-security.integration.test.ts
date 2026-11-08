import { createHash, randomBytes, randomUUID } from "node:crypto";
import postgres from "postgres";
import { createAnnouncement, listAnnouncementsForUser } from "@/lib/announcements-store";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  authenticateAdminPanel,
  createAdminPanelSession,
  getAdminPanelSession
} from "./admin-panel";
import {
  claimUnverifiedGoogleAccount,
  createAuthSession,
  createEmailVerificationFlow,
  createPasswordResetFlow,
  getAuthenticatedUser,
  resetPasswordWithToken,
  signInWithPassword,
  signUpWithPassword,
  verifyEmailToken
} from "./auth";
import { consumeOrgInvite, createOrgInvite, getOrgForAdmin } from "./org-store";

const url = process.env.SECURITY_TEST_DATABASE_URL;
const password = "Local-fixture1";
let sql: ReturnType<typeof postgres>;

async function signUp(memberType: "student" | "school" | "teacher" = "student") {
  const suffix = randomUUID();
  return signUpWithPassword({
    email: `fixture-${suffix}@example.test`,
    password,
    name: "Local fixture",
    memberType,
    organizationName: memberType === "school" ? `Local school ${suffix}` : null
  });
}

async function verify(email: string, inviteCode?: string) {
  const { verificationUrl } = await createEmailVerificationFlow(email, null, inviteCode);
  if (!verificationUrl) throw new Error("Missing local verification link");
  await verifyEmailToken(new URL(verificationUrl).searchParams.get("verify")!);
}

async function registerSchool() {
  const school = await signUp("school");
  await verify(school.email);
  const login = await signInWithPassword({ email: school.email, password });
  const org = await getOrgForAdmin(school.id);
  if (!org) throw new Error("Missing local school");
  return { ...login, org };
}

describe.skipIf(!url)("isolated PostgreSQL authorization", () => {
  beforeAll(() => {
    const target = new URL(url!);
    if (target.hostname !== "127.0.0.1" || target.port !== "55439" || target.pathname !== "/speakace_security_test") {
      throw new Error("Security tests require the isolated local speakace_security_test database.");
    }
    vi.stubEnv("DATABASE_URL", url!);
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("ADMIN_EMAILS", "");
    vi.stubEnv("ADMIN_PANEL_USERNAME", "");
    vi.stubEnv("ADMIN_PANEL_PASSWORD", "");
    sql = postgres(url!, { ssl: false, prepare: false, max: 4 });
    globalThis.__speakAceSql = sql;
  });

  afterAll(async () => {
    globalThis.__speakAceSql = undefined;
    await sql?.end();
    vi.unstubAllEnvs();
  });

  it("keeps self-registered schools scoped to their organization and revokes old platform sessions", async () => {
    const { profile, session, org } = await registerSchool();
    expect(profile).toMatchObject({ adminAccess: true, isAdmin: false, organizationId: org.id });
    expect(await getAuthenticatedUser(session.token)).toMatchObject({ isAdmin: false });
    await expect(authenticateAdminPanel({ identifier: profile.email, password })).rejects.toThrow("Invalid admin credentials");

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await sql`
      insert into admin_panel_sessions (id, admin_user_id, admin_label, auth_mode, token_hash, expires_at)
      values (${randomUUID()}, ${profile.id}, 'Old school session', 'member', ${tokenHash}, now() + interval '1 hour')
    `;
    expect(await getAdminPanelSession(token)).toBeNull();
  });

  it("requires email verification and allowlisting for member admins and rechecks existing sessions", async () => {
    const user = await signUp();
    vi.stubEnv("ADMIN_EMAILS", user.email);
    try {
      await expect(authenticateAdminPanel({ identifier: user.email, password })).rejects.toThrow("Invalid admin credentials");
      await verify(user.email);
      const identity = await authenticateAdminPanel({ identifier: user.email, password });
      const admin = await createAdminPanelSession(identity);
      expect(await getAdminPanelSession(admin.token)).toMatchObject({ adminUserId: user.id });
      vi.stubEnv("ADMIN_EMAILS", "");
      expect(await getAdminPanelSession(admin.token)).toBeNull();
    } finally {
      vi.stubEnv("ADMIN_EMAILS", "");
    }
  });

  it("revokes config sessions when the configured password changes", async () => {
    vi.stubEnv("ADMIN_PANEL_USERNAME", "Local Admin");
    vi.stubEnv("ADMIN_PANEL_PASSWORD", password);
    try {
      const identity = await authenticateAdminPanel({ identifier: "Local Admin", password });
      const session = await createAdminPanelSession(identity);
      expect(await getAdminPanelSession(session.token)).toMatchObject({ authMode: "config" });
      vi.stubEnv("ADMIN_PANEL_PASSWORD", "New-local-fixture2");
      expect(await getAdminPanelSession(session.token)).toBeNull();
    } finally {
      vi.stubEnv("ADMIN_PANEL_USERNAME", "");
      vi.stubEnv("ADMIN_PANEL_PASSWORD", "");
    }
  });

  it("accepts verified, matching, one-time teacher invitations and rejects the organization identifier", async () => {
    const { profile, org } = await registerSchool();
    const teacher = await signUp("teacher");
    const wrongTeacher = await signUp("teacher");
    await verify(wrongTeacher.email);
    const invite = await createOrgInvite({ orgId: org.id, createdBy: profile.id, role: "teacher", email: teacher.email });
    expect(await consumeOrgInvite({ inviteCode: org.id, userId: wrongTeacher.id })).toBeNull();
    expect(await consumeOrgInvite({ inviteCode: invite.inviteCode, userId: wrongTeacher.id })).toBeNull();
    expect(await consumeOrgInvite({ inviteCode: invite.inviteCode, userId: teacher.id })).toBeNull();
    await verify(teacher.email, invite.inviteCode.toUpperCase());
    const login = await signInWithPassword({ email: teacher.email, password });
    expect(login.profile).toMatchObject({ teacherAccess: true, organizationId: org.id, isAdmin: false });
    expect(await consumeOrgInvite({ inviteCode: invite.inviteCode, userId: teacher.id })).toBeNull();

    const openInvite = await createOrgInvite({ orgId: org.id, createdBy: profile.id, role: "teacher" });
    const attempts = await Promise.all([teacher, wrongTeacher].map(({ id }) =>
      consumeOrgInvite({ inviteCode: openInvite.inviteCode, userId: id })
    ));
    expect(attempts.filter(Boolean)).toHaveLength(1);
  });

  it("withholds organization announcements from legacy teacher memberships until reinvited", async () => {
    const { profile, org } = await registerSchool();
    const teacher = await signUp("teacher");
    await verify(teacher.email);
    await sql`
      insert into organization_memberships (id, organization_id, user_id, role)
      values (${randomUUID()}, ${org.id}, ${teacher.id}, 'teacher')
    `;
    await sql`update users set teacher_access = true, organization_id = ${org.id} where id = ${teacher.id}`;
    const { session } = await signInWithPassword({ email: teacher.email, password });
    const announcement = await createAnnouncement({
      authorId: profile.id,
      orgId: org.id,
      audienceType: "teacher",
      title: "Local announcement",
      body: "Local fixture"
    });

    const before = await getAuthenticatedUser(session.token);
    expect(await listAnnouncementsForUser(before!)).toEqual([]);
    const invite = await createOrgInvite({ orgId: org.id, createdBy: profile.id, role: "teacher", email: teacher.email });
    await consumeOrgInvite({ inviteCode: invite.inviteCode, userId: teacher.id });
    const after = await getAuthenticatedUser(session.token);
    expect(await listAnnouncementsForUser(after!)).toEqual([expect.objectContaining({ id: announcement.id })]);
  });

  it("invalidates member and admin sessions and other reset links after resetting a password", async () => {
    const user = await signUp();
    await verify(user.email);
    const login = await signInWithPassword({ email: user.email, password });
    vi.stubEnv("ADMIN_EMAILS", user.email);
    try {
      const identity = await authenticateAdminPanel({ identifier: user.email, password });
      const admin = await createAdminPanelSession(identity);
      async function resetToken() {
        const { resetUrl } = await createPasswordResetFlow(user.email);
        if (!resetUrl) throw new Error("Missing local reset link");
        return new URL(resetUrl).searchParams.get("reset")!;
      }
      const used = await resetToken();
      const unused = await resetToken();
      const newPassword = "New-local-fixture2";
      await resetPasswordWithToken({ token: used, password: newPassword });
      expect(await getAuthenticatedUser(login.session.token)).toBeNull();
      expect(await getAdminPanelSession(admin.token)).toBeNull();
      await expect(createAdminPanelSession(identity)).rejects.toThrow("Admin credentials changed");
      await expect(resetPasswordWithToken({ token: unused, password })).rejects.toThrow("invalid or expired");
      await expect(resetPasswordWithToken({ token: used, password })).rejects.toThrow("invalid or expired");
      await expect(signInWithPassword({ email: user.email, password })).rejects.toThrow("Invalid email or password");
      expect((await signInWithPassword({ email: user.email, password: newPassword })).profile.id).toBe(user.id);
    } finally {
      vi.stubEnv("ADMIN_EMAILS", "");
    }
  });

  it("clears a password set before a verified Google identity claims the account", async () => {
    const user = await signUp();
    await expect(createAuthSession(user.id)).rejects.toThrow("Could not sign in");
    await claimUnverifiedGoogleAccount(user.id);
    await expect(signInWithPassword({ email: user.email, password })).rejects.toThrow("Invalid email or password");
    const session = await createAuthSession(user.id);
    expect(await getAuthenticatedUser(session.token)).toMatchObject({ id: user.id, emailVerified: true });
  });
});
