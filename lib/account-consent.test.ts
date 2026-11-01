import { describe, expect, it } from "vitest";
import { hasRequiredAccountConsent, ACCOUNT_LEGAL_VERSION } from "./account-consent";
describe("account legal acknowledgement", () => {
  it("requires explicit separate terms and privacy acknowledgements at the current version", () => {
    expect(hasRequiredAccountConsent({termsAccepted:true,privacyAcknowledged:true,legalVersion:ACCOUNT_LEGAL_VERSION})).toBe(true);
    expect(hasRequiredAccountConsent({termsAccepted:true,legalVersion:ACCOUNT_LEGAL_VERSION})).toBe(false);
    expect(hasRequiredAccountConsent({termsAccepted:"true",privacyAcknowledged:true,legalVersion:ACCOUNT_LEGAL_VERSION})).toBe(false);
    expect(hasRequiredAccountConsent({termsAccepted:true,privacyAcknowledged:true,legalVersion:"old"})).toBe(false);
  });
});
