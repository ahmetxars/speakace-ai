import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listStudentClasses } from "@/lib/classroom-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";
import { listClassSharedStudyItems } from "@/lib/shared-study-store";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return getAuthenticatedUser(token);
}

export async function GET() {
  const profile = await getProfile();
  if (!profile || profile.role === "guest") {
    return NextResponse.json({ error: "Sign in to view shared study lists." }, { status: 401 });
  }

  const classes = await listStudentClasses(profile.id);
  const grouped = await Promise.all(
    classes.map(async (item) => ({
      classId: item.classId,
      className: item.className,
      teacherName: item.teacherName,
      items: await listClassSharedStudyItems(item.classId)
    }))
  );

  return NextResponse.json({ classes: grouped });
}
