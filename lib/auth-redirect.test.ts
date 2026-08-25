import { describe, expect, it } from "vitest";
import {
  GOOGLE_NEW_STUDENT_REDIRECT,
  resolveGoogleCallbackRedirect,
  resolvePracticeAuthEntry,
  resolveSafeAppRedirect
} from "@/lib/auth-redirect";

describe("resolvePracticeAuthEntry", () => {
  it("opens signup for measured public speaking demos", () => {
    expect(resolvePracticeAuthEntry("free_test_demo")).toEqual({
      mode: "signup",
      attributionPath: "/free-ielts-speaking-test#demo-cta"
    });
    expect(resolvePracticeAuthEntry("free_test_primary").mode).toBe("signup");
    expect(resolvePracticeAuthEntry("marketing_demo").mode).toBe("signup");
  });

  it("keeps returning and unknown practice sources on sign in", () => {
    expect(resolvePracticeAuthEntry("email_daily_tip")).toEqual({
      mode: "signin",
      attributionPath: null
    });
    expect(resolvePracticeAuthEntry("free_test_demo_fake").mode).toBe("signin");
    expect(resolvePracticeAuthEntry(null).mode).toBe("signin");
  });
});

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

describe("resolveGoogleCallbackRedirect", () => {
  it("sends a new student without an explicit destination to quick-start practice", () => {
    expect(resolveGoogleCallbackRedirect({
      isNewUser: true,
      memberType: "student"
    })).toBe(GOOGLE_NEW_STUDENT_REDIRECT);
  });

  it("preserves a safe explicit destination for signup and invite flows", () => {
    expect(resolveGoogleCallbackRedirect({
      requestedNext: "/app/profile?onboarding=1",
      isNewUser: true,
      memberType: "student"
    })).toBe("/app/profile?onboarding=1");
  });

  it("keeps existing users and non-student accounts on the app home", () => {
    expect(resolveGoogleCallbackRedirect({
      isNewUser: false,
      memberType: "student"
    })).toBe("/app");
    expect(resolveGoogleCallbackRedirect({
      isNewUser: true,
      memberType: "teacher"
    })).toBe("/app");
  });

  it("rejects an unsafe explicit destination before applying the signup default", () => {
    expect(resolveGoogleCallbackRedirect({
      requestedNext: "https://evil.example/steal",
      isNewUser: true,
      memberType: "student"
    })).toBe(GOOGLE_NEW_STUDENT_REDIRECT);
  });
});
