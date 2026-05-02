/**
 * Institution admin: create and list organization invites.
 *
 * POST /api/institution-admin/invites
 *   body: { role: "teacher" | "admin" | "student", email?: string, expiresInDays?: number }
 *   Returns the invite record with an inviteCode the admin can share.
 *
 * GET /api/institution-admin/invites
 *   Returns all pending invites for the admin's organization.
 */
import { NextResponse } from "next/server";
import { createOrgInvite, getOrgForAdmin } from "@/lib/server/org-store";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { permissionErrorResponse, requireSchoolAdmin } from "@/lib/server/permissions";
import { OrgInvite } from "@/lib/types";

export async function POST(request: Request) {
  try {
    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "Invite management requires a database connection." }, { status: 501 });
    }

    const profile = await requireSchoolAdmin();
    const org = await getOrgForAdmin(profile.id);
    if (!org) {
      return NextResponse.json({ error: "No organization found for your account." }, { status: 404 });
    }

    const body = await request.json();
    const role = body.role as "teacher" | "admin" | "student";
    if (!["teacher", "admin", "student"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be teacher, admin, or student." }, { status: 400 });
    }

    const invite = await createOrgInvite({
      orgId: org.id,
      role,
      email: typeof body.email === "string" ? body.email.trim().toLowerCase() || undefined : undefined,
      createdBy: profile.id,
      expiresInDays: typeof body.expiresInDays === "number" ? Math.min(30, Math.max(1, body.expiresInDays)) : 7
    });

    return NextResponse.json({ invite });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function GET() {
  try {
    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "Invite management requires a database connection." }, { status: 501 });
    }

    const profile = await requireSchoolAdmin();
    const org = await getOrgForAdmin(profile.id);
    if (!org) {
      return NextResponse.json({ invites: [] });
    }

    const sql = getSql();
    const invites = await sql<OrgInvite[]>`
      select
        id, org_id as "orgId", email, role, invite_code as "inviteCode",
        created_by as "createdBy", expires_at as "expiresAt",
        used_at as "usedAt", used_by as "usedBy", created_at as "createdAt"
      from organization_invites
      where org_id = ${org.id}
        and used_at is null
        and expires_at > now()
      order by created_at desc
    `;

    return NextResponse.json({ invites });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
