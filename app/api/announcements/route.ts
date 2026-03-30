import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAnnouncement, listAnnouncementsForUser } from "@/lib/announcements-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

async function getSignedInProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function GET() {
  const profile = await getSignedInProfile();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ announcements: [] });
  }
  const announcements = await listAnnouncementsForUser(profile);
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const profile = await getSignedInProfile();
  if (!profile || (!profile.isTeacher && !profile.isAdmin)) {
    return NextResponse.json({ error: "Teacher or admin access required." }, { status: 403 });
  }

  const limit = checkRateLimit({
    key: `announcement:${getRequestIp(request)}:${profile.id}`,
    windowMs: 1000 * 60 * 15,
    max: 20
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many announcements. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const audienceType =
      body.audienceType === "class" || body.audienceType === "teacher" || body.audienceType === "global"
        ? body.audienceType
        : "class";
    const announcement = await createAnnouncement({
      authorId: profile.id,
      audienceType: audienceType as "global" | "teacher" | "class",
      classId: body.classId ? String(body.classId) : null,
      title: String(body.title ?? ""),
      body: String(body.body ?? "")
    });
    return NextResponse.json({ announcement });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create announcement." }, { status: 400 });
  }
}
