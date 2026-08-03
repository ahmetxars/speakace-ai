import { describe, expect, it } from "vitest";
import { getRequestIp } from "@/lib/server/rate-limit";

describe("request IP resolution", () => {
  it("prefers the Vercel-owned forwarding header", () => {
    const request = new Request("https://speakace.org/api/marketing/lead", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "198.51.100.7"
      }
    });
    expect(getRequestIp(request)).toBe("203.0.113.10");
  });

  it("accepts a valid IPv6 address and rejects arbitrary bucket keys", () => {
    expect(getRequestIp(new Request("https://speakace.org", {
      headers: { "x-real-ip": "2001:db8::1" }
    }))).toBe("2001:db8::1");
    expect(getRequestIp(new Request("https://speakace.org", {
      headers: { "x-real-ip": "attacker-controlled-value" }
    }))).toBe("unknown");
  });
});
