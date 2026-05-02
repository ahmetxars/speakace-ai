import { NextResponse } from "next/server";
import { joinTeacherClassByCode, listStudentClasses } from "@/lib/classroom-store";
import { permissionErrorResponse, requireAuthenticatedUser } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function GET() {
  try {
    const profile = await requireAuthenticatedUser();
    const classes = await listStudentClasses(profile.id);
    return NextResponse.json({ classes });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireAuthenticatedUser();

    // Reject teacher/admin accounts from joining as students (H-3 fix).
    // Teachers and admins manage classes; they must not silently become students.
    if (profile.isTeacher || profile.isAdmin) {
      return NextResponse.json(
        { error: "Teacher and admin accounts cannot join classes as students." },
        { status: 403 }
      );
    }

    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `student-join-class:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 10,
      max: 10
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many join attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const result = await joinTeacherClassByCode({
      studentId: profile.id,
      joinCode: String(body.joinCode ?? "")
    });
    return NextResponse.json(result);
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
