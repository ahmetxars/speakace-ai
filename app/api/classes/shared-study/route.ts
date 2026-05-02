import { NextResponse } from "next/server";
import { listStudentClasses } from "@/lib/classroom-store";
import { permissionErrorResponse, requireAuthenticatedUser } from "@/lib/server/permissions";
import { listClassSharedStudyItems } from "@/lib/shared-study-store";

export async function GET(request: Request) {
  try {
    const profile = await requireAuthenticatedUser();

    // Only fetch shared items for classes the user is actually enrolled in.
    // This prevents arbitrary users from fetching another class's content by
    // supplying a classId they found (M-2 fix).
    const enrolledClasses = await listStudentClasses(profile.id);
    const enrolledClassIds = new Set(enrolledClasses.map((c) => c.classId));

    const url = new URL(request.url);
    const requestedClassId = url.searchParams.get("classId");

    if (requestedClassId) {
      if (!enrolledClassIds.has(requestedClassId)) {
        return NextResponse.json({ error: "You are not enrolled in this class." }, { status: 403 });
      }
      const items = await listClassSharedStudyItems(requestedClassId);
      return NextResponse.json({ items });
    }

    // Return shared items for all enrolled classes
    const grouped = await Promise.all(
      enrolledClasses.map(async (item) => ({
        classId: item.classId,
        className: item.className,
        teacherName: item.teacherName,
        items: await listClassSharedStudyItems(item.classId)
      }))
    );

    return NextResponse.json({ classes: grouped });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
