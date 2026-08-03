import { describe, expect, it } from "vitest";
import { resolveSafeAppRedirect } from "@/lib/auth-redirect";

describe("resolveSafeAppRedirect", () => {
  it("keeps app destinations and the exact Lemon checkout bridge", () => {
    expect(resolveSafeAppRedirect("/app")).toBe("/app");
    expect(resolveSafeAppRedirect("/app/practice?quickStart=1")).toBe(
      "/app/practice?quickStart=1"
    );
    expect(resolveSafeAppRedirect("/app/billing#plans")).toBe("/app/billing#plans");
    expect(
      resolveSafeAppRedirect(
        "/api/payments/lemon/checkout?plan=plus&billing=weekly&checkout_id=checkout-1"
      )
    ).toBe(
      "/api/payments/lemon/checkout?plan=plus&billing=weekly&checkout_id=checkout-1"
    );
  });

  it("rejects external, protocol-relative, and unrelated API destinations", () => {
    expect(resolveSafeAppRedirect("https://evil.example/steal")).toBeNull();
    expect(resolveSafeAppRedirect("//evil.example/steal")).toBeNull();
    expect(resolveSafeAppRedirect("/api/admin/users")).toBeNull();
    expect(resolveSafeAppRedirect("/api/payments/lemon/webhook")).toBeNull();
    expect(resolveSafeAppRedirect("/auth")).toBeNull();
    expect(resolveSafeAppRedirect("/application")).toBeNull();
  });
});
