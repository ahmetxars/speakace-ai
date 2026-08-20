import { describe, expect, it } from "vitest";
import {
  buildPracticeLimitEventId,
  getUpgradePromptDayKey,
  getUpgradePromptStorageKey,
  isFreePracticeQuotaExhausted,
  shouldShowUpgradePromptDialog
} from "@/lib/upgrade-prompt-frequency";

describe("upgrade prompt frequency", () => {
  const now = new Date("2026-07-23T18:00:00.000Z");

  it("shows the full dialog when it has not been shown today", () => {
    expect(shouldShowUpgradePromptDialog(null, now)).toBe(true);
    expect(shouldShowUpgradePromptDialog("2026-07-22", now)).toBe(true);
  });

  it("uses the compact recovery card after today's first dialog", () => {
    expect(shouldShowUpgradePromptDialog("2026-07-23", now)).toBe(false);
  });

  it("uses UTC day keys so the cap matches daily usage accounting", () => {
    expect(getUpgradePromptDayKey(new Date("2026-07-24T00:05:00.000Z"))).toBe("2026-07-24");
  });

  it("isolates the saved impression by learner", () => {
    expect(getUpgradePromptStorageKey("learner-1")).toBe("speakace-upgrade-prompt-day:learner-1");
    expect(getUpgradePromptStorageKey("learner-2")).not.toBe(getUpgradePromptStorageKey("learner-1"));
  });

  it("blocks free practice when either daily quota is exhausted", () => {
    expect(isFreePracticeQuotaExhausted({
      plan: "free",
      freeSessionsRemaining: 0,
      remainingMinutesToday: 8
    })).toBe(true);
    expect(isFreePracticeQuotaExhausted({
      plan: "free",
      freeSessionsRemaining: 2,
      remainingMinutesToday: 0
    })).toBe(true);
  });

  it("keeps practice available when quota remains or the learner is paid", () => {
    expect(isFreePracticeQuotaExhausted({
      plan: "free",
      freeSessionsRemaining: 1,
      remainingMinutesToday: 1
    })).toBe(false);
    expect(isFreePracticeQuotaExhausted({
      plan: "plus",
      freeSessionsRemaining: 0,
      remainingMinutesToday: 0
    })).toBe(false);
  });

  it("deduplicates limit events by learner, UTC day, and reason", () => {
    const eventId = buildPracticeLimitEventId("learner-1", "practice_limit_hit", now);

    expect(eventId).toBe("limit-hit:learner-1:2026-07-23:practice_limit_hit");
    expect(eventId).toMatch(/^[a-zA-Z0-9:_-]{8,160}$/);
    expect(buildPracticeLimitEventId("learner-1", "practice_limit_hit", now)).toBe(eventId);
    expect(buildPracticeLimitEventId("learner-1", "result_retry_locked", now)).not.toBe(eventId);
    expect(buildPracticeLimitEventId(
      "learner-1",
      "practice_limit_hit",
      new Date("2026-07-24T00:00:00.000Z")
    )).not.toBe(eventId);
  });
});
