import { afterEach, describe, expect, it, vi } from "vitest";
import { requestAdminAction } from "./admin-request";
afterEach(() => vi.unstubAllGlobals());
const options = { method: "POST", body: '{"title":"draft"}' };
describe("admin mutation responses", () => {
  it("preserves the request and returns a confirmed response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      requestAdminAction("/api/admin/test", options, "Başarısız"),
    ).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/test",
      expect.objectContaining({ ...options, signal: expect.any(AbortSignal) }),
    );
  });
  it("surfaces server rejection and does not retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "Yetki yok" }), { status: 403 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      requestAdminAction("/api/admin/test", options, "Başarısız"),
    ).rejects.toThrow("Yetki yok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("describes a lost response as uncertain instead of inviting duplicate submission", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      requestAdminAction("/api/admin/test", options, "Başarısız"),
    ).rejects.toThrow("Tekrar göndermeden önce");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("does not treat an unreadable success response as a confirmed mutation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not-json", { status: 200 })),
    );
    await expect(
      requestAdminAction("/api/admin/test", options, "Başarısız"),
    ).rejects.toThrow("İşlem sonucu doğrulanamadı");
  });
  it("handles a non-JSON gateway error with the action-specific message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Bad gateway", { status: 502 })),
    );
    await expect(
      requestAdminAction("/api/admin/test", options, "Kayıt kaydedilemedi"),
    ).rejects.toThrow("Kayıt kaydedilemedi");
  });
});
