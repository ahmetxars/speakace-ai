import { describe, expect, it } from "vitest";
import {
  buildPracticeLimitRecoveryEmailContent,
  buildOnboardingEmailContent,
  isEmailQuotaFailureRecovered,
  ONBOARDING_EMAIL_SCHEDULE,
  resolveEmailLifecycleDailyBudget,
  resolveEmailQuotaKind,
  resolvePracticeLimitRecoveryReason,
  resolveTrialLifecycleStage
} from "@/lib/server/email-sequences";

describe("onboarding lifecycle segmentation", () => {
  it("schedules the first retention follow-up one day after signup", () => {
    expect(ONBOARDING_EMAIL_SCHEDULE.find((step) => step.emailNumber === 2)?.dayOffset).toBe(1);
  });

  it("keeps the onboarding sequence focused to five high-intent messages", () => {
    expect(ONBOARDING_EMAIL_SCHEDULE).toEqual([
      { dayOffset: 0, emailNumber: 1 },
      { dayOffset: 1, emailNumber: 2 },
      { dayOffset: 4, emailNumber: 3 },
      { dayOffset: 10, emailNumber: 4 },
      { dayOffset: 21, emailNumber: 5 }
    ]);
  });

  it("sends activated learners into an attributed day-one return session", () => {
    const email = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 2,
      speakingSessionCount: 1
    });

    expect(email?.subject).toContain("second-day speaking round");
    expect(email?.html).toContain("quickStart=1");
    expect(email?.html).toContain("activation=email_day_one_return");
    expect(email?.html).toContain("no plan change or checkout step");
    expect(email?.html).not.toContain("api/payments/lemon/checkout");
  });

  it("keeps first-score guidance for learners who have not activated", () => {
    const email = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 2,
      speakingSessionCount: 0
    });

    expect(email?.subject).toContain("IELTS tip");
    expect(email?.html).toContain("activation=email_first_score");
    expect(email?.html).not.toContain("email_day_one_return");
  });

  it("sends a first-score activation instead of a checkout pitch before any practice", () => {
    const email = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 4,
      speakingSessionCount: 0
    });

    expect(email?.subject).toContain("first SpeakAce score");
    expect(email?.html).toContain("quickStart=1");
    expect(email?.html).toContain("activation=email_first_score");
    expect(email?.html).not.toContain("Unlock full feedback");
    expect(email?.html).not.toContain("35 minutes of daily speaking");
  });

  it("keeps the Plus offer for learners who have already practiced", () => {
    const email = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 4,
      speakingSessionCount: 1
    });

    expect(email?.subject).toBe("Keep practicing today, not tomorrow");
    expect(email?.html).toContain("api/payments/lemon/checkout");
    expect(email?.html).toContain("35 minutes of daily speaking");
  });

  it("links the welcome email directly to an attributed quick-start session", () => {
    const email = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 1,
      speakingSessionCount: 0
    });

    expect(email?.html).toContain("quickStart=1");
    expect(email?.text).toContain("activation=email_first_score");
    expect(email?.html).not.toContain("thousands of IELTS candidates");
  });

  it("uses product guidance instead of unverified statistics or testimonials", () => {
    const dayTen = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 5,
      speakingSessionCount: 2
    });
    const dayFortyFive = buildOnboardingEmailContent({
      name: "Learner",
      emailNumber: 9,
      speakingSessionCount: 2
    });

    expect(dayTen?.html).not.toContain("+0.7");
    expect(dayTen?.html).not.toContain("SpeakAce user");
    expect(dayFortyFive?.html).not.toContain("real story");
    expect(dayFortyFive?.html).not.toContain("SpeakAce user");
  });
});

describe("email quota protection", () => {
  it("recognizes provider daily and monthly quota failures", () => {
    expect(resolveEmailQuotaKind('{"name":"daily_quota_exceeded"}')).toBe("daily");
    expect(resolveEmailQuotaKind('{"name":"monthly_quota_exceeded"}')).toBe("monthly");
    expect(resolveEmailQuotaKind("network unavailable")).toBeNull();
    expect(resolveEmailQuotaKind(null)).toBeNull();
  });

  it("uses a conservative lifecycle budget and clamps unsafe overrides", () => {
    expect(resolveEmailLifecycleDailyBudget(undefined)).toBe(20);
    expect(resolveEmailLifecycleDailyBudget("35")).toBe(35);
    expect(resolveEmailLifecycleDailyBudget("-1")).toBe(0);
    expect(resolveEmailLifecycleDailyBudget("1000")).toBe(200);
    expect(resolveEmailLifecycleDailyBudget("invalid")).toBe(20);
  });

  it("clears only failures that happened before a successful recovery probe", () => {
    const failureAt = "2026-07-23T04:38:33.620Z";

    expect(isEmailQuotaFailureRecovered(failureAt, "2026-07-23T05:00:00.000Z")).toBe(true);
    expect(isEmailQuotaFailureRecovered(failureAt, "2026-07-23T04:00:00.000Z")).toBe(false);
    expect(isEmailQuotaFailureRecovered(failureAt, null)).toBe(false);
  });
});

describe("trial lifecycle scheduling", () => {
  const now = new Date("2026-07-22T06:00:00.000Z");

  it("sends activation guidance during the first two trial days", () => {
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-24T18:00:00.000Z", now })).toBe("activation");
  });

  it("switches to renewal transparency in the final 24 hours", () => {
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-22T18:00:00.000Z", now })).toBe("ending");
  });

  it("does not schedule messages outside the live trial window", () => {
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-25T18:00:01.000Z", now })).toBeNull();
    expect(resolveTrialLifecycleStage({ trialEndsAt: "2026-07-22T05:59:59.000Z", now })).toBeNull();
  });
});

describe("practice limit recovery", () => {
  it("sends limit-hit learners directly to an attributed weekly trial checkout", () => {
    const email = buildPracticeLimitRecoveryEmailContent({
      name: "Learner",
      reason: "practice_limit_hit"
    });

    expect(email.subject).toContain("practice you started");
    expect(email.html).toContain("plan=plus");
    expect(email.html).toContain("billing=weekly");
    expect(email.html).toContain("campaign=practice_limit_recovery_practice_limit_hit");
    expect(email.html).toContain("cta_event=checkout_initiated");
    expect(email.html).toContain("$0 today");
    expect(email.html).toContain("$3.99/week");
    expect(email.html).not.toContain("unlimited practice");
  });

  it("uses the fresh-feedback retry message for result locks", () => {
    const email = buildPracticeLimitRecoveryEmailContent({
      name: "Learner",
      reason: "result_retry_locked"
    });

    expect(email.subject).toContain("answer you just improved");
    expect(email.html).toContain("stronger second answer");
    expect(email.html).toContain("practice_limit_recovery_result_retry_locked");
  });

  it("resolves a safe reason from persisted analytics paths", () => {
    expect(resolvePracticeLimitRecoveryReason("/app/practice/result_retry_locked/trial_dialog")).toBe("result_retry_locked");
    expect(resolvePracticeLimitRecoveryReason("/app/practice/practice_limit_hit/trial_dialog")).toBe("practice_limit_hit");
    expect(resolvePracticeLimitRecoveryReason(null)).toBe("practice_limit_hit");
  });
});
