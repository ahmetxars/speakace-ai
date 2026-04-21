import { NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getMember, upsertMember } from "@/lib/store";

export async function GET() {
  try {
    const profile = await getAuthenticatedUserFromCookies();
    if (!profile || profile.role === "guest") {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const currentProfile = await getMember(profile.id);
    return NextResponse.json({ profile: currentProfile ?? null });
  } catch {
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const currentProfile = await getAuthenticatedUserFromCookies();
    if (!currentProfile || currentProfile.role === "guest") {
      return NextResponse.json({ ok: false, skipped: true }, { status: 401 });
    }

    const body = await request.json();
    return NextResponse.json({
      profile: await upsertMember({
        ...currentProfile,
        ...body,
        id: currentProfile.id,
        email: currentProfile.email,
        role: currentProfile.role,
        memberType: currentProfile.memberType,
        createdAt: currentProfile.createdAt
      })
    });
  } catch {
    return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
  }
}
