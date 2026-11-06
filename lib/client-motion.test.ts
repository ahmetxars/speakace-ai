import { afterEach, describe, expect, it, vi } from "vitest";
import { motionAllowed } from "./client-motion";
afterEach(() => vi.unstubAllGlobals());
describe("motion preference safety", () => {
  it("does not animate on the server", () =>
    expect(motionAllowed()).toBe(false));
  it.each([true, false])("respects reduced-motion preference %s", (reduced) => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: reduced }) });
    vi.stubGlobal("document", { visibilityState: "visible" });
    expect(motionAllowed()).toBe(!reduced);
  });
  it("does not animate in a hidden document", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal("document", { visibilityState: "hidden" });
    expect(motionAllowed()).toBe(false);
  });
});
