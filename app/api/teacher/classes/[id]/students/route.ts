import { NextResponse } from "next/server";
import { addStudentToTeacherClass, listClassStudents, listPendingClassRequests } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const { id } = await params;
    const [students, pendingRequests] = await Promise.all([
      listClassStudents({ teacherId: profile.id, classId: id }),
      listPendingClassRequests({ teacherId: profile.id, classId: id })
    ]);
    return NextResponse.json({ students, pendingRequests });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const ip = getRequestIp(request);
    const limit = checkRateLimit({
      key: `teacher-add-student:${ip}:${profile.id}`,
      windowMs: 1000 * 60 * 30,
      max: 24
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many student add attempts. Please try again later." }, { status: 429 });
    }
    const body = await request.json();
    const { id } = await params;
    const student = await addStudentToTeacherClass({
      teacherId: profile.id,
      classId: id,
      studentEmail: String(body.email ?? "")
    });
    return NextResponse.json({ student });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
