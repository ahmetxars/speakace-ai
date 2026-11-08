import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAnnouncement, listAnnouncementsForUser } from "@/lib/announcements-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { requireTeacherOwnsClass } from "@/lib/server/permissions";
import { getOrgForAdmin } from "@/lib/server/org-store";

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
  if (!profile || profile.role !== "member") {
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
    const requestedAudienceType = typeof body.audienceType === "string" ? body.audienceType : "class";
    const audienceType =
      requestedAudienceType === "class" || requestedAudienceType === "teacher"
        ? requestedAudienceType
        : "class";

    if (requestedAudienceType === "global") {
      return NextResponse.json({ error: "Platform-wide announcements are not allowed from app dashboards." }, { status: 403 });
    }
    let orgId = profile.organizationId ?? null;
    let classId: string | null = null;
    if (audienceType === "teacher") {
      const org = await getOrgForAdmin(profile.id);
      if (!org) {
        return NextResponse.json({ error: "Organization admin access required." }, { status: 403 });
      }
      orgId = org.id;
    } else {
      if (!profile.isTeacher) {
        return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
      }
      classId = body.classId ? String(body.classId) : null;
      if (!classId) {
        return NextResponse.json({ error: "Class id is required for class announcements." }, { status: 400 });
      }
      await requireTeacherOwnsClass(profile.id, classId);
    }
    const announcement = await createAnnouncement({
      authorId: profile.id,
      orgId,
      audienceType,
      classId,
      title: String(body.title ?? ""),
      body: String(body.body ?? "")
    });
    return NextResponse.json({ announcement });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create announcement.";
    const status = error instanceof Error && "statusCode" in error && typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? ((error as { statusCode: number }).statusCode)
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
