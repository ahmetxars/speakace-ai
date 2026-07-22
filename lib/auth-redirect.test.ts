import { describe, expect, it } from "vitest";
import { resolveSafeAppRedirect } from "@/lib/auth-redirect";

describe("safe post-auth redirects", () => {
  it("preserves an attributed app quick-start path", () => {
    expect(resolveSafeAppRedirect(
      "/app/practice?quickStart=1&runMode=interview&activation=email_first_score"
    )).toBe("/app/practice?quickStart=1&runMode=interview&activation=email_first_score");
  });

  it("allows the app root and nested app routes", () => {
    expect(resolveSafeAppRedirect("/app")).toBe("/app");
    expect(resolveSafeAppRedirect("/app/billing#plans")).toBe("/app/billing#plans");
  });

  it("rejects external, protocol-relative, and non-app destinations", () => {
    expect(resolveSafeAppRedirect("https://example.com/app")).toBeNull();
    expect(resolveSafeAppRedirect("//example.com/app")).toBeNull();
    expect(resolveSafeAppRedirect("/auth")).toBeNull();
    expect(resolveSafeAppRedirect("/application")).toBeNull();
  });
});
