import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCheckoutRecoveryEmailContent,
  buildDailyTipEmailContent,
  buildPracticeLimitRecoveryEmailContent,
  buildOnboardingEmailContent,
  isEmailQuotaFailureRecovered,
  ONBOARDING_EMAIL_SCHEDULE,
  EMAIL_RESERVATION_RETRY_AFTER_MS,
  EMAIL_RESERVATION_RETRY_CUTOFF_MS,
  completeEmailLifecycleReservation,
  personalizeLifecycleEmail,
  releaseEmailLifecycleReservation,
  reserveEmailLifecycleSend,
  resetEmailLifecycleReservationMemoryStoreForTests,
  resolveEmailLifecycleDailyBudget,
  resolveEmailQuotaKind,
  resolvePracticeLimitRecoveryReason,
  resolveTrialLifecycleStage
} from "@/lib/server/email-sequences";

const dailyTip = {
  subject: "Speaking tip: Build a stronger example",
  headline: "Use one specific example",
  body: "A concrete example makes an answer easier to follow.",
  example: "\"Last weekend, I practised this during a mock interview.\""
};

describe("onboarding lifecycle segmentation", () => {
  it("schedules the first retention follow-up one day after signup", () => {
    expect(ONBOARDING_EMAIL_SCHEDULE.find((step) => step.emailNumber === 2)?.dayOffset).toBe(1);
  });

  it("keeps the onboarding sequence focused to five high-intent messages", () => {
    expect(ONBOARDING_EMAIL_SCHEDULE).toEqual([
      { dayOffset: 0, emailNumber: 1 },
      { dayOffset: 1, emailNumber: 2 },
      { dayOffset: 3, emailNumber: 3 },
      { dayOffset: 5, emailNumber: 4 },
      { dayOffset: 7, emailNumber: 5 }
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

  it("includes the legal sender identity and opt-out in HTML and plain text", () => {
    const previous = {
      legalName: process.env.COMPANY_LEGAL_NAME,
      postalAddress: process.env.COMPANY_POSTAL_ADDRESS,
      unsubscribeSecret: process.env.UNSUBSCRIBE_SECRET
    };
    process.env.COMPANY_LEGAL_NAME = "SpeakAce Example & Co";
    process.env.COMPANY_POSTAL_ADDRESS = "Example Street 1, Amsterdam";
    process.env.UNSUBSCRIBE_SECRET = "lifecycle-compliance-test-secret";

    try {
      const content = buildOnboardingEmailContent({
        name: "Learner",
        emailNumber: 4,
        speakingSessionCount: 1
      });
      expect(content).not.toBeNull();
      const personalized = personalizeLifecycleEmail(content!, "learner@example.test");

      expect(personalized.emailContent.html).toContain("Commercial practice email from SpeakAce Example &amp; Co");
      expect(personalized.emailContent.html).toContain("Example Street 1, Amsterdam");
      expect(personalized.emailContent.text).toContain("Commercial practice email from SpeakAce Example & Co, Example Street 1, Amsterdam.");
      expect(personalized.emailContent.text).toContain("Unsubscribe: https://speakace.org/unsubscribe?");
    } finally {
      if (previous.legalName === undefined) delete process.env.COMPANY_LEGAL_NAME;
      else process.env.COMPANY_LEGAL_NAME = previous.legalName;
      if (previous.postalAddress === undefined) delete process.env.COMPANY_POSTAL_ADDRESS;
      else process.env.COMPANY_POSTAL_ADDRESS = previous.postalAddress;
      if (previous.unsubscribeSecret === undefined) delete process.env.UNSUBSCRIBE_SECRET;
      else process.env.UNSUBSCRIBE_SECRET = previous.unsubscribeSecret;
    }
  });
});

describe("email quota protection", () => {
  it("recognizes provider daily and monthly quota failures", () => {
    expect(resolveEmailQuotaKind('{"name":"daily_quota_exceeded"}')).toBe("daily");
    expect(resolveEmailQuotaKind('{"name":"monthly_quota_exceeded"}')).toBe("monthly");
    expect(resolveEmailQuotaKind("network unavailable")).toBeNull();
    expect(resolveEmailQuotaKind(null)).toBeNull();
  });

  it("defaults to a conservative budget and clamps unsafe overrides", () => {
    expect(resolveEmailLifecycleDailyBudget(undefined)).toBe(15);
    expect(resolveEmailLifecycleDailyBudget("35")).toBe(35);
    expect(resolveEmailLifecycleDailyBudget("-1")).toBe(0);
    expect(resolveEmailLifecycleDailyBudget("1200")).toBe(1000);
    expect(resolveEmailLifecycleDailyBudget("invalid")).toBe(15);
  });

  it("reserves production email capacity for transactional mail", () => {
    vi.stubEnv("APP_ENV", "production");
    try {
      expect(resolveEmailLifecycleDailyBudget("500")).toBe(15);
      expect(resolveEmailLifecycleDailyBudget("5")).toBe(5);
      expect(resolveEmailLifecycleDailyBudget("0")).toBe(0);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("clears only failures that happened before a successful recovery probe", () => {
    const failureAt = "2026-07-23T04:38:33.620Z";

    expect(isEmailQuotaFailureRecovered(failureAt, "2026-07-23T05:00:00.000Z")).toBe(true);
    expect(isEmailQuotaFailureRecovered(failureAt, "2026-07-23T04:00:00.000Z")).toBe(false);
    expect(isEmailQuotaFailureRecovered(failureAt, null)).toBe(false);
  });
});

describe("email quota reservations", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalBudget = process.env.EMAIL_LIFECYCLE_DAILY_BUDGET;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    process.env.EMAIL_LIFECYCLE_DAILY_BUDGET = "1";
    resetEmailLifecycleReservationMemoryStoreForTests();
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    if (originalBudget === undefined) delete process.env.EMAIL_LIFECYCLE_DAILY_BUDGET;
    else process.env.EMAIL_LIFECYCLE_DAILY_BUDGET = originalBudget;
    resetEmailLifecycleReservationMemoryStoreForTests();
  });

  it("deduplicates in-flight and sent messages while enforcing the daily budget", async () => {
    await expect(reserveEmailLifecycleSend("message-a")).resolves.toEqual({
      reserved: true,
      reason: "reserved"
    });
    await expect(reserveEmailLifecycleSend("message-a")).resolves.toEqual({
      reserved: false,
      reason: "in_flight"
    });
    await expect(reserveEmailLifecycleSend("message-b")).resolves.toEqual({
      reserved: false,
      reason: "budget_exhausted"
    });

    await releaseEmailLifecycleReservation("message-a");
    await expect(reserveEmailLifecycleSend("message-b")).resolves.toEqual({
      reserved: true,
      reason: "reserved"
    });
    await completeEmailLifecycleReservation("message-b");
    await expect(reserveEmailLifecycleSend("message-b")).resolves.toEqual({
      reserved: false,
      reason: "already_sent"
    });
  });

  it("retries an ambiguous reservation inside the provider idempotency window", async () => {
    const startedAt = new Date("2026-08-03T08:00:00.000Z");
    await expect(reserveEmailLifecycleSend("ambiguous-message", startedAt)).resolves.toEqual({
      reserved: true,
      reason: "reserved"
    });
    await expect(reserveEmailLifecycleSend(
      "ambiguous-message",
      new Date(startedAt.getTime() + EMAIL_RESERVATION_RETRY_AFTER_MS - 1)
    )).resolves.toEqual({ reserved: false, reason: "in_flight" });
    await expect(reserveEmailLifecycleSend(
      "ambiguous-message",
      new Date(startedAt.getTime() + EMAIL_RESERVATION_RETRY_AFTER_MS)
    )).resolves.toEqual({ reserved: true, reason: "retry" });
    await expect(reserveEmailLifecycleSend(
      "ambiguous-message",
      new Date(startedAt.getTime() + EMAIL_RESERVATION_RETRY_CUTOFF_MS)
    )).resolves.toEqual({ reserved: false, reason: "in_flight" });
  });

  it("charges a cross-day retry against the new day's atomic budget", async () => {
    const firstAttempt = new Date("2026-08-03T23:50:00.000Z");
    const retryAttempt = new Date("2026-08-04T00:10:00.000Z");
    await expect(reserveEmailLifecycleSend("cross-day-message", firstAttempt)).resolves.toEqual({
      reserved: true,
      reason: "reserved"
    });
    await expect(reserveEmailLifecycleSend("cross-day-message", retryAttempt)).resolves.toEqual({
      reserved: true,
      reason: "retry"
    });
    await expect(reserveEmailLifecycleSend(
      "new-message-on-retry-day",
      new Date("2026-08-04T00:11:00.000Z")
    )).resolves.toEqual({
      reserved: false,
      reason: "budget_exhausted"
    });
  });
});

describe("daily speaking tip personalization", () => {
  it("turns the latest weak category into a focused sixty-second return", () => {
    const email = buildDailyTipEmailContent({
      name: "Learner",
      tip: dailyTip,
      focus: {
        label: "Fluency and Coherence",
        score: 5.5,
        nextExercise: "Retry one Part 2 answer with fewer filler words."
      }
    });

    expect(email.subject).toContain("Fluency and Coherence");
    expect(email.subject).toContain("one 60-second retry");
    expect(email.html).toContain("Your score to beat");
    expect(email.html).toContain("Fluency and Coherence · 5.5");
    expect(email.html).toContain("Retry one Part 2 answer with fewer filler words.");
    expect(email.html).toContain("activation=email_daily_tip");
    expect(email.html).toContain("runMode=drill");
    expect(email.html).not.toContain("runMode=interview");
    expect(email.html).toContain("Start my 60-second retry");
    expect(email.html).toContain("display:none");
    expect(email.html).not.toContain("api/payments/lemon/checkout");
  });

  it("offers a single free score to learners without a scored session", () => {
    const email = buildDailyTipEmailContent({
      name: "Learner",
      tip: dailyTip
    });

    expect(email.subject).toBe("Your free speaking score takes one answer");
    expect(email.html).toContain(dailyTip.headline);
    expect(email.html).toContain("Get my first free score");
    expect(email.html).not.toContain("Your score to beat");
  });

  it("uses an opaque tracked CTA when the sender provides one", () => {
    const trackedUrl = "https://speakace.org/api/email/continue?token=opaque-token";
    const email = buildDailyTipEmailContent({
      name: "Learner",
      tip: dailyTip,
      ctaUrl: trackedUrl
    });

    expect(email.html).toContain(trackedUrl);
    expect(email.text).toContain(trackedUrl);
    expect(email.html).not.toContain("activation=email_daily_tip");
  });

  it("escapes report text before inserting it into email HTML", () => {
    const email = buildDailyTipEmailContent({
      name: "<Learner>",
      tip: dailyTip,
      focus: {
        label: "<script>alert(1)</script>",
        score: 4,
        nextExercise: "<img src=x onerror=alert(1)>"
      }
    });

    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
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

describe("checkout recovery", () => {
  it("states the exact renewal terms without claiming a charge or discount", () => {
    const email = buildCheckoutRecoveryEmailContent("Learner");

    expect(email.subject).toContain("checkout");
    expect(email.html).toContain("Nothing was charged");
    expect(email.html).toContain("billing=weekly");
    expect(email.html).toContain("campaign=checkout_recovery");
    expect(email.html).toContain("$0 today");
    expect(email.html).toContain("$3.99/week");
    expect(email.html).not.toContain("LAUNCH20");
    expect(email.html).not.toContain("discount");
  });
});
