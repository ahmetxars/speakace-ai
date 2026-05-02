import { NextResponse } from "next/server";
import { listOrgUsers, updateOrgUserAccess, getOrgForAdmin } from "@/lib/server/org-store";
import { permissionErrorResponse, requireSchoolAdmin } from "@/lib/server/permissions";
import { hasDatabaseUrl } from "@/lib/server/db";
import { listInstitutionUsers, updateInstitutionUserAccess } from "@/lib/classroom-store";

export async function GET(request: Request) {
  try {
    const profile = await requireSchoolAdmin();
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? "";

    if (hasDatabaseUrl()) {
      const org = await getOrgForAdmin(profile.id);
      if (!org) {
        return NextResponse.json({ users: [] });
      }
      const users = await listOrgUsers(org.id, search);
      return NextResponse.json({ users });
    }

    // In-memory dev fallback
    const users = await listInstitutionUsers(undefined, search);
    return NextResponse.json({ users });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await requireSchoolAdmin();

    const body = await request.json();
    const targetUserId = String(body.userId ?? "");
    if (!targetUserId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    if (hasDatabaseUrl()) {
      const org = await getOrgForAdmin(profile.id);
      if (!org) {
        return NextResponse.json({ error: "No organization found for your account." }, { status: 404 });
      }
      const user = await updateOrgUserAccess({
        actorId: profile.id,
        orgId: org.id,
        targetUserId,
        adminAccess: typeof body.adminAccess === "boolean" ? body.adminAccess : undefined,
        teacherAccess: typeof body.teacherAccess === "boolean" ? body.teacherAccess : undefined
      });
      return NextResponse.json({ user });
    }

    // In-memory dev fallback
    const user = await updateInstitutionUserAccess({
      userId: targetUserId,
      adminAccess: typeof body.adminAccess === "boolean" ? body.adminAccess : undefined,
      teacherAccess: typeof body.teacherAccess === "boolean" ? body.teacherAccess : undefined
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
