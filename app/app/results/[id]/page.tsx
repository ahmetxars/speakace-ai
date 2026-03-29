import { notFound } from "next/navigation";
import { ResultView } from "@/components/result-view";
import { getProgressSummary, getSession } from "@/lib/store";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);

  if (!session) {
    notFound();
  }

  const summary = await getProgressSummary(session.userId);

  return <ResultView session={session} summary={summary} />;
}
