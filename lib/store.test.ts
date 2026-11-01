import { describe, expect, it, beforeEach } from "vitest";
import { createMemberProfile, createGuestProfile } from "@/lib/membership";
import {
  applyBillingPlanByUserId,
  createSession,
  evaluateStoredSession,
  getProgressSummary,
  reserveSessionAudioUpload,
  releaseFailedAudioUpload,
  resetStore,
  uploadSessionAudio
} from "@/lib/store";
import { upsertMember } from "@/lib/store";

describe("session store", () => {
  beforeEach(async () => {
    await resetStore();
  });

  it("charges free usage only after a recording is submitted", async () => {
    const guest = createGuestProfile();
    await upsertMember(guest);

    for (let index = 0; index < 4; index += 1) {
      const result = await createSession({
        userId: guest.id,
        examType: "IELTS",
        taskType: "ielts-part-1",
        difficulty: "Starter"
      });
      expect("session" in result).toBe(true);
    }

    const beforeRecording = await getProgressSummary(guest.id);
    expect(beforeRecording.freeSessionsRemaining).toBe(4);
    expect(beforeRecording.totalSessions).toBe(0);
    expect(beforeRecording.recentSessions).toHaveLength(0);

    for (let index = 0; index < 4; index += 1) {
      const result = await createSession({
        userId: guest.id,
        examType: "IELTS",
        taskType: "ielts-part-1",
        difficulty: "Starter"
      });
      if (!("session" in result)) throw new Error("Expected session creation to succeed.");
      const reservation = await reserveSessionAudioUpload(result.session!.id, 24_000);
      expect(reservation.reserved).toBe(true);
    }

    const blocked = await createSession({
      userId: guest.id,
      examType: "IELTS",
      taskType: "ielts-part-1",
      difficulty: "Starter"
    });

    expect("error" in blocked).toBe(true);
  });

  it("does not charge the same recording twice", async () => {
    const member = createMemberProfile("idempotent@example.com", "Idempotent");
    await upsertMember(member);

    const created = await createSession({
      userId: member.id,
      examType: "IELTS",
      taskType: "ielts-part-1",
      difficulty: "Starter"
    });
    if (!("session" in created)) throw new Error("Expected session creation to succeed.");

    const first = await reserveSessionAudioUpload(created.session!.id, 24_000);
    const second = await reserveSessionAudioUpload(created.session!.id, 24_000);
    const summary = await getProgressSummary(member.id);

    expect(first).toEqual({ reserved: true, alreadyUploaded: false });
    expect(second).toEqual({ reserved: true, alreadyUploaded: true });
    expect(summary.freeSessionsRemaining).toBe(3);
  });

  it("refunds failed transcription once and preserves a successful retry", async () => {
    const member = createMemberProfile("retry@example.com", "Retry");
    await upsertMember(member);
    const created = await createSession({userId:member.id,examType:"IELTS",taskType:"ielts-part-1",difficulty:"Starter"});
    if (!("session" in created)) throw new Error("Expected session.");
    const id = created.session!.id;
    await reserveSessionAudioUpload(id, 24000);
    await releaseFailedAudioUpload(id);
    await releaseFailedAudioUpload(id);
    expect((await getProgressSummary(member.id)).freeSessionsRemaining).toBe(4);
    await uploadSessionAudio(id,24000,"I enjoy reading because it helps me relax after a busy day.");
    await releaseFailedAudioUpload(id);
    expect((await getProgressSummary(member.id)).freeSessionsRemaining).toBe(3);
  });

  it("builds a report after audio upload", async () => {
    const member = createMemberProfile("demo@example.com", "Demo");
    await upsertMember({ ...member, plan: "plus" });

    const created = await createSession({
      userId: member.id,
      examType: "TOEFL",
      taskType: "toefl-independent",
      difficulty: "Target"
    });

    if (!("session" in created)) {
      throw new Error("Expected session creation to succeed.");
    }

    const session = created.session!;
    await uploadSessionAudio(session.id, 140_000);
    const evaluated = await evaluateStoredSession(session.id);

    expect(evaluated?.report?.overall).toBeGreaterThan(0);
    expect(evaluated?.transcript).toContain("In this response");
  });

  it("returns progress summary values", async () => {
    const member = createMemberProfile("summary@example.com", "Summary");
    await upsertMember({ ...member, plan: "pro" });

    const created = await createSession({
      userId: member.id,
      examType: "IELTS",
      taskType: "ielts-part-2",
      difficulty: "Target"
    });

    if (!("session" in created)) {
      throw new Error("Expected session creation to succeed.");
    }

    const session = created.session!;
    await uploadSessionAudio(session.id, 110_000);
    await evaluateStoredSession(session.id);

    const summary = await getProgressSummary(member.id);

    expect(summary.totalSessions).toBe(1);
    expect(summary.averageScore).toBeGreaterThan(0);
    expect(summary.streakDays).toBe(1);
    expect(summary.recentSessions).toHaveLength(1);
  });

  it("applies a paid plan by user id when checkout email differs", async () => {
    const member = createMemberProfile("account@example.com", "Account Owner");
    await upsertMember(member);

    const updated = await applyBillingPlanByUserId({
      userId: member.id,
      plan: "pro",
      billingStatus: "active",
      providerCustomerId: "customer_123",
      providerSubscriptionId: "subscription_123"
    });

    expect(updated?.plan).toBe("pro");
    expect(updated?.billingStatus).toBe("active");
    expect(updated?.lemonCustomerId).toBe("customer_123");
    expect(updated?.lemonSubscriptionId).toBe("subscription_123");
  });
});
