import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackClientEvent } from "@/lib/analytics-client";

describe("trackClientEvent", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { cookie: `speakace_consent=${encodeURIComponent(JSON.stringify({version:"2026-11-01",analytics:true,savedAt:Date.now()}))}` });
  });
  it("sends no analytics before opt-in", async () => {
    vi.stubGlobal("document", { cookie: "" });
    const fetchMock = vi.fn(); const sendBeacon = vi.fn();
    vi.stubGlobal("fetch", fetchMock); vi.stubGlobal("navigator", {sendBeacon});
    await trackClientEvent({event:"pricing_view",path:"/pricing"});
    expect(fetchMock).not.toHaveBeenCalled(); expect(sendBeacon).not.toHaveBeenCalled();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("queues navigation-safe analytics with sendBeacon", async () => {
    const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => true);
    const fetchMock = vi.fn();
    vi.stubGlobal("navigator", { sendBeacon });
    vi.stubGlobal("fetch", fetchMock);

    await trackClientEvent({
      event: "pricing_plus_click",
      path: "/pricing/plus/weekly",
      source: "pricing_primary",
      plan: "plus"
    });

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(sendBeacon).toHaveBeenCalledWith(
      "/api/analytics/track",
      expect.any(Blob)
    );
    expect(fetchMock).not.toHaveBeenCalled();

    const payload = sendBeacon.mock.calls[0]?.[1];
    expect(payload).toBeInstanceOf(Blob);
    await expect((payload as Blob).text()).resolves.toEqual(
      expect.stringContaining('"source":"pricing_primary"')
    );
  });

  it("falls back to keepalive fetch when sendBeacon cannot queue", async () => {
    const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => false);
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("navigator", { sendBeacon });
    vi.stubGlobal("fetch", fetchMock);

    await trackClientEvent({
      event: "pricing_plus_click",
      path: "/pricing/plus/annual"
    });

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics/track",
      expect.objectContaining({
        method: "POST",
        keepalive: true
      })
    );
  });
});
