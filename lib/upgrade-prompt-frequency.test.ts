import { describe, expect, it } from "vitest";
import {
  getUpgradePromptDayKey,
  getUpgradePromptStorageKey,
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
});
