import { describe, expect, it } from "vitest";
import { shouldOfferRecordingRecovery } from "@/lib/practice-recovery";

const NOW = new Date("2026-09-01T18:00:00.000Z").getTime();

describe("shouldOfferRecordingRecovery", () => {
  it("offers recovery for a recent incomplete recording", () => {
    expect(shouldOfferRecordingRecovery({
      audioUploaded: false,
      createdAt: "2026-09-01T17:45:00.000Z"
    }, NOW)).toBe(true);
  });

  it("does not interrupt a recording that may still be in progress", () => {
    expect(shouldOfferRecordingRecovery({
      audioUploaded: false,
      createdAt: "2026-09-01T17:58:00.000Z"
    }, NOW)).toBe(false);
  });

  it("does not recover completed or expired attempts", () => {
    expect(shouldOfferRecordingRecovery({
      audioUploaded: true,
      createdAt: "2026-09-01T17:45:00.000Z"
    }, NOW)).toBe(false);
    expect(shouldOfferRecordingRecovery({
      audioUploaded: false,
      createdAt: "2026-08-29T17:59:00.000Z"
    }, NOW)).toBe(false);
  });
});
