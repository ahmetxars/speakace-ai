import { describe, expect, it } from "vitest";
import { parseCookieConsent, CONSENT_MAX_AGE, CONSENT_VERSION } from "./cookie-consent";
const encode = (data: unknown) => encodeURIComponent(JSON.stringify(data));
describe("cookie consent validity", () => {
  it("keeps analytics off for missing, invalid, obsolete or expired choices", () => {
    for(const value of [undefined,"broken", encode({version:CONSENT_VERSION,analytics:"true",savedAt:Date.now()}),encode({version:"old",analytics:true,savedAt:Date.now()}),encode({version:CONSENT_VERSION,analytics:true,savedAt:Date.now()-CONSENT_MAX_AGE*1000-1})]) expect(parseCookieConsent(value)).toBeNull();
  });
  it("preserves an explicit rejection as a valid choice", () => {
    expect(parseCookieConsent(encode({version:CONSENT_VERSION,analytics:false,savedAt:Date.now()}))?.analytics).toBe(false);
  });
});
