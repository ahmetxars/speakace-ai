import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getMember, upsertMember } from "@/lib/store";

export async function GET() {
  const profile = await getAuthenticatedUserFromCookies();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const currentProfile = await getMember(profile.id);
    return NextResponse.json({ profile: currentProfile ?? null });
  } catch {
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const currentProfile = await getAuthenticatedUserFromCookies();
  if (!currentProfile || currentProfile.role === "guest") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = await request.json();

    return NextResponse.json({
      profile: await upsertMember({
        ...currentProfile,
        // Whitelist only user-editable fields on MemberProfile — avatarDataUrl lives in student_profiles, not here
        name: typeof body.name === "string" ? body.name.trim().slice(0, 100) : currentProfile.name,
        organizationName: typeof body.organizationName === "string" ? body.organizationName.trim().slice(0, 200) : currentProfile.organizationName,
        // Locked fields — always restored from server-side session
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
  } catch {
    return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
  }
}
