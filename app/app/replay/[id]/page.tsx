import { notFound } from "next/navigation";
import { SessionReplay } from "@/components/session-replay";
import { getProgressSummary, getSession } from "@/lib/store";

export default async function SessionReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) notFound();
  const summary = await getProgressSummary(session.userId);
  return <SessionReplay session={session} summary={summary} />;
}
