import { describe, expect, it } from "vitest";
import { resolveTrialLifecycleStage } from "@/lib/server/email-sequences";

describe("trial lifecycle scheduling", () => {
  const now = new Date("2026-07-22T06:00:00.000Z");

  it("sends activation guidance during the first two trial days", () => {
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-24T18:00:00.000Z", now })).toBe("activation");
  });

  it("switches to renewal transparency in the final 24 hours", () => {
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-22T18:00:00.000Z", now })).toBe("ending");
  });

  it("does not schedule messages outside the live trial window", () => {
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-25T18:00:01.000Z", now })).toBeNull();
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-22T05:59:59.000Z", now })).toBeNull();
  });
});
