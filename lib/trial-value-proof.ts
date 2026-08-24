import { SpeakingSession } from "@/lib/types";

export type TrialValueProof = {
  stage: "baseline" | "retry" | "complete";
  baselineSession: SpeakingSession | null;
  retrySession: SpeakingSession | null;
  baselineScore: number | null;
  retryScore: number | null;
  delta: number | null;
};

function sessionTime(session: SpeakingSession) {
  const value = new Date(session.createdAt).getTime();
  return Number.isFinite(value) ? value : 0;
}

export function getTrialValueProof(
  sessions: SpeakingSession[],
  options?: { since?: string | null }
): TrialValueProof {
  const parsedSince = options?.since ? new Date(options.since).getTime() : NaN;
  const since = Number.isFinite(parsedSince) ? parsedSince : null;
  const scored = sessions
    .filter((session) => session.audioUploaded && session.report && (since === null || sessionTime(session) >= since))
    .sort((a, b) => sessionTime(a) - sessionTime(b));

  if (!scored.length) {
    return {
      stage: "baseline",
      baselineSession: null,
      retrySession: null,
      baselineScore: null,
      retryScore: null,
      delta: null
    };
  }

  const attemptsByPrompt = new Map<string, SpeakingSession[]>();
  for (const session of scored) {
    const key = `${session.examType}:${session.taskType}:${session.prompt.id}`;
    const attempts = attemptsByPrompt.get(key) ?? [];
    attempts.push(session);
    attemptsByPrompt.set(key, attempts);
  }

  const completedLoop = [...attemptsByPrompt.values()]
    .filter((attempts) => attempts.length >= 2)
    .sort((a, b) => sessionTime(b.at(-1)!) - sessionTime(a.at(-1)!))[0];

  if (completedLoop) {
    const baselineSession = completedLoop[0];
    const retrySession = completedLoop.at(-1)!;
    const baselineScore = baselineSession.report!.overall;
    const retryScore = retrySession.report!.overall;
    return {
      stage: "complete",
      baselineSession,
      retrySession,
      baselineScore,
      retryScore,
      delta: Number((retryScore - baselineScore).toFixed(1))
    };
  }

  const baselineSession = scored.at(-1)!;
  return {
    stage: "retry",
    baselineSession,
    retrySession: null,
    baselineScore: baselineSession.report!.overall,
    retryScore: null,
    delta: null
  };
}
