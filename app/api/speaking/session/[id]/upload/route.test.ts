import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUserFromCookies: vi.fn(),
  getAudioPayloadStats: vi.fn(),
  hasOpenAiKey: vi.fn(),
  transcribeAudio: vi.fn(),
  checkRateLimit: vi.fn(),
  getSession: vi.fn(),
  reserveSessionAudioUpload: vi.fn(),
  releaseFailedAudioUpload: vi.fn(),
  uploadSessionAudio: vi.fn()
}));

vi.mock("@/lib/server/auth", () => ({
  getAuthenticatedUserFromCookies: mocks.getAuthenticatedUserFromCookies
}));

vi.mock("@/lib/server/openai", () => ({
  getAudioPayloadStats: mocks.getAudioPayloadStats,
  hasOpenAiKey: mocks.hasOpenAiKey,
  transcribeAudio: mocks.transcribeAudio
}));

vi.mock("@/lib/server/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit
}));

vi.mock("@/lib/store", () => ({
  getSession: mocks.getSession,
  reserveSessionAudioUpload: mocks.reserveSessionAudioUpload,
  releaseFailedAudioUpload: mocks.releaseFailedAudioUpload,
  uploadSessionAudio: mocks.uploadSessionAudio
}));

import { POST } from "@/app/api/speaking/session/[id]/upload/route";

const session = {
  id: "session-1",
  userId: "user-1",
  examType: "IELTS",
  prompt: {
    title: "A useful skill",
    prompt: "Describe a useful skill you learned."
  }
};

function uploadRequest() {
  return new Request("https://speakace.org/api/speaking/session/session-1/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ audioBase64: "valid-audio-payload" })
  });
}

describe("speaking audio upload quota", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.getAuthenticatedUserFromCookies.mockResolvedValue({ id: "user-1", role: "student", isAdmin: false });
    mocks.getAudioPayloadStats.mockReturnValue({ bytes: 24_000 });
    mocks.hasOpenAiKey.mockReturnValue(true);
    mocks.checkRateLimit.mockReturnValue({ allowed: true });
    mocks.getSession.mockResolvedValue(session);
  });

  it("rejects an exhausted allowance before starting paid transcription", async () => {
    mocks.reserveSessionAudioUpload.mockResolvedValue({
      reserved: false,
      error: "Free users can complete 4 sessions per day.",
      status: 403
    });

    const response = await POST(uploadRequest(), { params: Promise.resolve({ id: "session-1" }) });

    expect(response.status).toBe(403);
    expect(mocks.transcribeAudio).not.toHaveBeenCalled();
    expect(mocks.uploadSessionAudio).not.toHaveBeenCalled();
  });

  it("does not invent a transcript or charge allowance on provider failure", async () => {
    mocks.reserveSessionAudioUpload.mockResolvedValue({reserved:true,alreadyUploaded:false});
    mocks.transcribeAudio.mockRejectedValue(new Error("provider error with sensitive details"));
    const response = await POST(uploadRequest(), {params:Promise.resolve({id:"session-1"})});
    expect(response.status).toBe(503);
    expect(mocks.releaseFailedAudioUpload).toHaveBeenCalledWith("session-1",expect.any(String));
    expect(mocks.uploadSessionAudio).not.toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toContain("sensitive details");
  });

  it("reuses a completed transcript without calling the provider again", async () => {
    mocks.getSession.mockResolvedValue({
      ...session,
      audioUploaded: true,
      transcriptSource: "openai",
      transcript: "An existing transcript."
    });
    const response = await POST(uploadRequest(), { params: Promise.resolve({ id: "session-1" }) });
    expect(response.status).toBe(200);
    expect((await response.json()).session.transcript).toBe("An existing transcript.");
    expect(mocks.transcribeAudio).not.toHaveBeenCalled();
  });

  it("transcribes after an idempotent usage reservation succeeds", async () => {
    mocks.reserveSessionAudioUpload.mockResolvedValue({ reserved: true, alreadyUploaded: false });
    mocks.transcribeAudio.mockResolvedValue("I learned how to organize my time.");
    mocks.uploadSessionAudio.mockResolvedValue(session);

    const response = await POST(uploadRequest(), { params: Promise.resolve({ id: "session-1" }) });

    expect(response.status).toBe(200);
    expect(mocks.reserveSessionAudioUpload).toHaveBeenCalledWith("session-1", 24_000);
    expect(mocks.transcribeAudio).toHaveBeenCalledOnce();
    expect(mocks.uploadSessionAudio).toHaveBeenCalledWith(
      "session-1",
      24_000,
      "I learned how to organize my time.",
      expect.objectContaining({ transcriptSource: "openai" })
    );
  });
});
