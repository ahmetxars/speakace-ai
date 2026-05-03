import { NextResponse } from "next/server";
import { updateEnrollmentApproval } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const body = await request.json();
    const { id } = await params;
    await updateEnrollmentApproval({
      teacherId: profile.id,
      classId: id,
      studentId: String(body.studentId ?? ""),
      action: body.action === "reject" ? "reject" : "approve"
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
