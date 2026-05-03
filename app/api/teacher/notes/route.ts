import { NextResponse } from "next/server";
import { createTeacherNote } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const profile = await requireTeacher();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `teacher-note:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 15,
      max: 40
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many note submissions. Please try again later." }, { status: 429 });
    }
    const body = await request.json();
    const note = await createTeacherNote({
      teacherId: profile.id,
      studentId: String(body.studentId ?? ""),
      sessionId: body.sessionId ? String(body.sessionId) : undefined,
      note: String(body.note ?? ""),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : []
    });
    return NextResponse.json({ note });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
