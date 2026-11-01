import { describe, expect, it } from "vitest";
import { getPrivacyControllerIdentity } from "@/lib/server/privacy-controller";

describe("privacy controller identity", () => {
  it("uses visibly development-only fallbacks outside production", () => {
    expect(getPrivacyControllerIdentity({ NODE_ENV: "development" })).toMatchObject({
      legalName: "SpeakAce AI — development configuration",
      postalAddress: null
    });
  });

  it("fails closed for a self-hosted production runtime without legal identity", () => {
    expect(() => getPrivacyControllerIdentity({ NODE_ENV: "production" })).toThrow(
      "COMPANY_LEGAL_NAME is required"
    );
  });

  it("does not require publishing a private home address for a named individual", () => {
    expect(getPrivacyControllerIdentity({NODE_ENV:"production",COMPANY_LEGAL_NAME:"Ahmet Arslan"})).toMatchObject({legalName:"Ahmet Arslan",postalAddress:null});
  });

  it("returns the configured controller details in production", () => {
    expect(getPrivacyControllerIdentity({
      NODE_ENV: "production",
      COMPANY_LEGAL_NAME: "SpeakAce Example B.V.",
      COMPANY_POSTAL_ADDRESS: "Example Street 1, Amsterdam",
      PRIVACY_EU_REPRESENTATIVE: "Example Representative",
      PRIVACY_DPO_EMAIL: "privacy@example.test"
    })).toEqual({
      legalName: "SpeakAce Example B.V.",
      postalAddress: "Example Street 1, Amsterdam",
      representative: "Example Representative",
      dpoEmail: "privacy@example.test"
    });
  });
});
