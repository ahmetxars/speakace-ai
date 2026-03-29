import { describe, expect, it, beforeEach } from "vitest";
import { createMemberProfile, createGuestProfile } from "@/lib/membership";
import { createSession, evaluateStoredSession, getProgressSummary, resetStore, uploadSessionAudio } from "@/lib/store";
import { upsertMember } from "@/lib/store";

describe("session store", () => {
  beforeEach(async () => {
    await resetStore();
  });

  it("limits free sessions after the daily cap", async () => {
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

    const blocked = await createSession({
      userId: guest.id,
      examType: "IELTS",
      taskType: "ielts-part-1",
      difficulty: "Starter"
    });

    expect("error" in blocked).toBe(true);
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

    await uploadSessionAudio(created.session.id, 140_000);
    const evaluated = await evaluateStoredSession(created.session.id);

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

    await uploadSessionAudio(created.session.id, 110_000);
    await evaluateStoredSession(created.session.id);

    const summary = await getProgressSummary(member.id);

    expect(summary.totalSessions).toBe(1);
    expect(summary.averageScore).toBeGreaterThan(0);
    expect(summary.recentSessions).toHaveLength(1);
  });
});
