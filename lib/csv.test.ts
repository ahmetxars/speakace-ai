import { describe, expect, it } from "vitest";
import { csvCell } from "@/lib/csv";

describe("CSV export cells", () => {
  it.each(["=1+2", "+1", "-1", "@SUM(1)", "  =1", "\t=1", "＝1", "\rname"])(
    "exports %j as literal text",
    (input) => expect(csvCell(input)).toBe(`"'${input}"`)
  );

  it("keeps ordinary names, delimiters and quotes in a single field", () => {
    expect(csvCell('Ada "A", Example')).toBe('"Ada ""A"", Example"');
  });
});
