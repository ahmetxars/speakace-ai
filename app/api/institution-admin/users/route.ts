import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listInstitutionUsers, updateInstitutionUserAccess } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

async function getAdminProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  if (!profile?.isAdmin) return null;
  return profile;
}

export async function GET(request: Request) {
  const profile = await getAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const users = await listInstitutionUsers(search);
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const profile = await getAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const user = await updateInstitutionUserAccess({
      userId: String(body.userId ?? ""),
      adminAccess: typeof body.adminAccess === "boolean" ? body.adminAccess : undefined,
      teacherAccess: typeof body.teacherAccess === "boolean" ? body.teacherAccess : undefined
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update user access." }, { status: 400 });
  }
}
