import { describe, expect, it } from "vitest";
import { getTrialValueProof } from "@/lib/trial-value-proof";
import { SpeakingSession } from "@/lib/types";

function buildSession(input: {
  id: string;
  promptId: string;
  createdAt: string;
  score?: number;
}): SpeakingSession {
  return {
    id: input.id,
    userId: "user-test",
    examType: "IELTS",
    taskType: "ielts-part-2",
    difficulty: "Target",
    plan: "plus",
    prompt: {
      id: input.promptId,
      examType: "IELTS",
      taskType: "ielts-part-2",
      title: "Describe a useful object",
      prompt: "Describe a useful object you own.",
      prepSeconds: 60,
      speakingSeconds: 120,
      difficulty: "Target"
    },
    createdAt: input.createdAt,
    audioUploaded: input.score !== undefined,
    report: input.score === undefined
      ? undefined
      : {
          overall: input.score,
          scaleLabel: "IELTS band",
          categories: [],
          strengths: [],
          improvements: [],
          nextExercise: "Retry the same prompt.",
          caution: "",
          fillerWords: [],
          improvedAnswer: ""
        }
  };
}

describe("trial value proof", () => {
  it("starts with a baseline when there are no scored answers", () => {
    const proof = getTrialValueProof([
      buildSession({ id: "started", promptId: "prompt-1", createdAt: "2026-08-24T08:00:00.000Z" })
    ]);

    expect(proof.stage).toBe("baseline");
    expect(proof.baselineSession).toBeNull();
  });

  it("uses the latest scored answer as the retry baseline", () => {
    const proof = getTrialValueProof([
      buildSession({ id: "older", promptId: "prompt-1", createdAt: "2026-08-24T08:00:00.000Z", score: 4.5 }),
      buildSession({ id: "latest", promptId: "prompt-2", createdAt: "2026-08-24T09:00:00.000Z", score: 5 })
    ]);

    expect(proof.stage).toBe("retry");
    expect(proof.baselineSession?.id).toBe("latest");
    expect(proof.baselineScore).toBe(5);
  });

  it("compares the first and latest scored attempts on the same prompt", () => {
    const proof = getTrialValueProof([
      buildSession({ id: "first", promptId: "prompt-1", createdAt: "2026-08-24T08:00:00.000Z", score: 4.5 }),
      buildSession({ id: "middle", promptId: "prompt-1", createdAt: "2026-08-24T09:00:00.000Z", score: 5 }),
      buildSession({ id: "latest", promptId: "prompt-1", createdAt: "2026-08-24T10:00:00.000Z", score: 5.5 })
    ]);

    expect(proof.stage).toBe("complete");
    expect(proof.baselineSession?.id).toBe("first");
    expect(proof.retrySession?.id).toBe("latest");
    expect(proof.delta).toBe(1);
  });

  it("does not count an unfinished second attempt as proof", () => {
    const proof = getTrialValueProof([
      buildSession({ id: "first", promptId: "prompt-1", createdAt: "2026-08-24T08:00:00.000Z", score: 4.5 }),
      buildSession({ id: "unfinished", promptId: "prompt-1", createdAt: "2026-08-24T09:00:00.000Z" })
    ]);

    expect(proof.stage).toBe("retry");
    expect(proof.retrySession).toBeNull();
  });

  it("ignores same-prompt retries completed before the current access window", () => {
    const proof = getTrialValueProof(
      [
        buildSession({ id: "old-first", promptId: "prompt-1", createdAt: "2026-08-20T08:00:00.000Z", score: 4 }),
        buildSession({ id: "old-retry", promptId: "prompt-1", createdAt: "2026-08-20T09:00:00.000Z", score: 5 }),
        buildSession({ id: "current", promptId: "prompt-2", createdAt: "2026-08-24T08:00:00.000Z", score: 4.5 })
      ],
      { since: "2026-08-22T08:00:00.000Z" }
    );

    expect(proof.stage).toBe("retry");
    expect(proof.baselineSession?.id).toBe("current");
  });
});
