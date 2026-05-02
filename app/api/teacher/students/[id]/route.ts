import { NextResponse } from "next/server";
import { getTeacherStudentDetail } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const { id } = await params;

    // getTeacherStudentDetail verifies enrollment and scopes session history
    // to post-enrollment sessions only (H-2 fix, completed by Batch 2 Issue 1).
    const detail = await getTeacherStudentDetail({ teacherId: profile.id, studentId: id });
    return NextResponse.json(detail);
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
