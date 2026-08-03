import { describe, expect, it } from "vitest";
import { calculateIeltsSpeakingBand } from "@/lib/ielts-speaking-band";

describe("IELTS Speaking planning estimate", () => {
  it("averages the four equally weighted criteria", () => {
    expect(
      calculateIeltsSpeakingBand({
        fluency: 7,
        lexicalResource: 6.5,
        grammar: 6,
        pronunciation: 6.5
      })
    ).toMatchObject({
      average: 6.5,
      estimatedBand: 6.5,
      weakestScore: 6,
      weakestCriteria: ["grammar"],
      strongestScore: 7,
      strongestCriteria: ["fluency"],
      spread: 1
    });
  });

  it("shows the nearest half band for quarter-band averages", () => {
    expect(
      calculateIeltsSpeakingBand({
        fluency: 6,
        lexicalResource: 6,
        grammar: 6.5,
        pronunciation: 6.5
      }).estimatedBand
    ).toBe(6.5);

    expect(
      calculateIeltsSpeakingBand({
        fluency: 6.5,
        lexicalResource: 6.5,
        grammar: 7,
        pronunciation: 7
      }).estimatedBand
    ).toBe(7);
  });

  it("returns every tied priority criterion", () => {
    expect(
      calculateIeltsSpeakingBand({
        fluency: 6,
        lexicalResource: 6.5,
        grammar: 6,
        pronunciation: 7
      }).weakestCriteria
    ).toEqual(["fluency", "grammar"]);
  });

  it("rejects out-of-range and non-half-band inputs", () => {
    expect(() =>
      calculateIeltsSpeakingBand({
        fluency: 9.5,
        lexicalResource: 7,
        grammar: 7,
        pronunciation: 7
      })
    ).toThrow();

    expect(() =>
      calculateIeltsSpeakingBand({
        fluency: 6.25,
        lexicalResource: 7,
        grammar: 7,
        pronunciation: 7
      })
    ).toThrow();
  });
});
