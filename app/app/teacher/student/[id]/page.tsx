import { TeacherStudentDetail } from "@/components/teacher-student-detail";

export default async function TeacherStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherStudentDetail studentId={id} />;
}
