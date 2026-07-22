import { describe, expect, it } from "vitest";
import { getPracticeMomentum, getUtcPracticeDayKey } from "@/lib/practice-streak";

const now = new Date("2026-07-22T12:00:00.000Z");

describe("practice momentum", () => {
  it("counts several completed sessions on one day as one streak day", () => {
    const momentum = getPracticeMomentum(
      [
        { createdAt: "2026-07-22T08:00:00.000Z", audioUploaded: true },
        { createdAt: "2026-07-22T10:00:00.000Z", audioUploaded: true },
        { createdAt: "2026-07-22T11:00:00.000Z", audioUploaded: true }
      ],
      now
    );

    expect(momentum.streakDays).toBe(1);
    expect(momentum.activeDays7).toBe(1);
    expect(momentum.practicedToday).toBe(true);
  });

  it("counts consecutive completed practice days", () => {
    const momentum = getPracticeMomentum(
      [
        { createdAt: "2026-07-22T08:00:00.000Z", audioUploaded: true },
        { createdAt: "2026-07-21T08:00:00.000Z", audioUploaded: true },
        { createdAt: "2026-07-20T08:00:00.000Z", audioUploaded: true },
        { createdAt: "2026-07-19T08:00:00.000Z", audioUploaded: false }
      ],
      now
    );

    expect(momentum.streakDays).toBe(3);
    expect(momentum.activeDays7).toBe(3);
  });

  it("keeps yesterday's streak alive until today is completed", () => {
    const momentum = getPracticeMomentum(
      [
        { createdAt: "2026-07-21T08:00:00.000Z", audioUploaded: true },
        { createdAt: "2026-07-20T08:00:00.000Z", audioUploaded: true }
      ],
      now
    );

    expect(momentum.streakDays).toBe(2);
    expect(momentum.practicedToday).toBe(false);
  });

  it("resets the streak after a missed day without erasing recent active days", () => {
    const momentum = getPracticeMomentum(
      [{ createdAt: "2026-07-20T08:00:00.000Z", audioUploaded: true }],
      now
    );

    expect(momentum.streakDays).toBe(0);
    expect(momentum.activeDays7).toBe(1);
  });

  it("ignores invalid dates and incomplete sessions", () => {
    const momentum = getPracticeMomentum(
      [
        { createdAt: "not-a-date", audioUploaded: true },
        { createdAt: "2026-07-22T08:00:00.000Z", audioUploaded: false }
      ],
      now
    );

    expect(momentum.streakDays).toBe(0);
    expect(momentum.activeDays7).toBe(0);
    expect(getUtcPracticeDayKey("not-a-date")).toBeNull();
  });
});
