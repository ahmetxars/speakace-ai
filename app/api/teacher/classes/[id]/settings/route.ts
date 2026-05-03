import { NextResponse } from "next/server";
import { updateTeacherClassSettings } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const body = await request.json();
    const { id } = await params;
    const classroom = await updateTeacherClassSettings({
      teacherId: profile.id,
      classId: id,
      approvalRequired: Boolean(body.approvalRequired),
      joinMessage: body.joinMessage ? String(body.joinMessage) : ""
    });
    return NextResponse.json({ classroom });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
