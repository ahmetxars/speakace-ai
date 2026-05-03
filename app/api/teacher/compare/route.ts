import { NextResponse } from "next/server";
import { compareStudentsForTeacher } from "@/lib/classroom-store";
import { permissionErrorResponse, requireTeacher } from "@/lib/server/permissions";

export async function GET(request: Request) {
  try {
    const profile = await requireTeacher();
    const url = new URL(request.url);
    const leftId = url.searchParams.get("leftId") ?? "";
    const rightId = url.searchParams.get("rightId") ?? "";
    if (!leftId || !rightId) {
      return NextResponse.json({ error: "Two student ids are required." }, { status: 400 });
    }
    const comparison = await compareStudentsForTeacher({ teacherId: profile.id, leftId, rightId });
    return NextResponse.json({ comparison });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
