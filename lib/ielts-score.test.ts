import { describe, expect, it } from "vitest";
import { calculateIeltsOverallBand } from "@/lib/ielts-score";

describe("IELTS overall band calculation", () => {
  it("keeps a whole-band average unchanged", () => {
    expect(calculateIeltsOverallBand([7, 7, 6.5, 7.5])).toEqual({
      average: 7,
      overall: 7
    });
  });

  it("rounds a .25 average up to the next half band", () => {
    expect(calculateIeltsOverallBand([6.5, 6.5, 6, 6])).toEqual({
      average: 6.25,
      overall: 6.5
    });
  });

  it("rounds a .75 average up to the next whole band", () => {
    expect(calculateIeltsOverallBand([7, 7, 6.5, 6.5])).toEqual({
      average: 6.75,
      overall: 7
    });
  });

  it("rejects incomplete or invalid score sets", () => {
    expect(() => calculateIeltsOverallBand([7, 7, 7])).toThrow();
    expect(() => calculateIeltsOverallBand([9.5, 7, 7, 7])).toThrow();
  });
});
