import { describe, expect, it } from "vitest";
import {
  buildOnboardingEmailContent,
  resolveTrialLifecycleStage
} from "@/lib/server/email-sequences";

describe("onboarding lifecycle segmentation", () => {
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
