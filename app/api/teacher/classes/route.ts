import { NextResponse } from "next/server";
import { createTeacherClass, listTeacherClasses } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function GET() {
  try {
    const profile = await requireTeacher();
    const classes = await listTeacherClasses(profile.id);
    return NextResponse.json({ classes });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireTeacher();

    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `teacher-class-create:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 30,
      max: 12
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many class creation attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const classroom = await createTeacherClass({
      teacherId: profile.id,
      name: String(body.name ?? "")
    });
    return NextResponse.json({ classroom });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
