import { NextResponse } from "next/server";
import { getTeacherClassAnalytics } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireTeacher();
    const { id } = await context.params;
    const analytics = await getTeacherClassAnalytics({ teacherId: profile.id, classId: id });
    return NextResponse.json({ analytics });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
