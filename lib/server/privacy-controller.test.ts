import { describe, expect, it } from "vitest";
import { getPrivacyControllerIdentity } from "@/lib/server/privacy-controller";

describe("privacy controller identity", () => {
  it("uses visibly development-only fallbacks outside production", () => {
    expect(getPrivacyControllerIdentity({ NODE_ENV: "development" })).toMatchObject({
      legalName: "SpeakAce AI — development configuration",
      postalAddress: "Production postal address must be configured before launch"
    });
  });

  it("fails closed for a self-hosted production runtime without legal identity", () => {
    expect(() => getPrivacyControllerIdentity({ NODE_ENV: "production" })).toThrow(
      "COMPANY_LEGAL_NAME and COMPANY_POSTAL_ADDRESS are required"
    );
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
