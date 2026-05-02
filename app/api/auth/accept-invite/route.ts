/**
 * POST /api/auth/accept-invite
 *
 * Authenticated users call this endpoint to redeem an organization invite code.
 * On success the user is added to the organization with the appropriate role and
 * their teacherAccess / adminAccess DB flags are updated.
 *
 * This is the secure replacement for the old pattern of granting privileges
 * at signup based on self-selected memberType (audit finding C-1).
 */
import { NextResponse } from "next/server";
import { consumeOrgInvite } from "@/lib/server/org-store";
import { permissionErrorResponse, requireAuthenticatedUser } from "@/lib/server/permissions";
import { hasDatabaseUrl } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const profile = await requireAuthenticatedUser();

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ error: "Invite redemption requires a database connection." }, { status: 501 });
    }

    const body = await request.json();
    const inviteCode = String(body.inviteCode ?? "").trim();
    if (!inviteCode) {
      return NextResponse.json({ error: "inviteCode is required." }, { status: 400 });
    }

    const result = await consumeOrgInvite({
      inviteCode,
      userId: profile.id,
      userEmail: profile.email
    });

    if (!result) {
      return NextResponse.json(
        { error: "Invite code is invalid, expired, or not addressed to your email." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      orgId: result.org.id,
      orgName: result.org.name,
      role: result.role
    });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
