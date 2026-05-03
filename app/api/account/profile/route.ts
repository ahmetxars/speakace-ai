import { NextResponse } from "next/server";
import { permissionErrorResponse, requireAuthenticatedUser } from "@/lib/server/permissions";
import { getMember, upsertMember } from "@/lib/store";

export async function GET() {
  try {
    const profile = await requireAuthenticatedUser();
    const currentProfile = await getMember(profile.id);
    return NextResponse.json({ profile: currentProfile ?? null });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentProfile = await requireAuthenticatedUser();
    const body = await request.json();

    return NextResponse.json({
      profile: await upsertMember({
        ...currentProfile,
        // Whitelist only user-editable MemberProfile fields.
        name: typeof body.name === "string" ? body.name.trim().slice(0, 100) : currentProfile.name,
        organizationName:
          typeof body.organizationName === "string"
            ? body.organizationName.trim().slice(0, 200)
            : currentProfile.organizationName,
        // Locked fields — always restored from server-side session.
        id: currentProfile.id,
        email: currentProfile.email,
        role: currentProfile.role,
        memberType: currentProfile.memberType,
        createdAt: currentProfile.createdAt,
        plan: currentProfile.plan,
        billingStatus: currentProfile.billingStatus,
        adminAccess: currentProfile.adminAccess,
        teacherAccess: currentProfile.teacherAccess,
        organizationId: currentProfile.organizationId
      })
    });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
