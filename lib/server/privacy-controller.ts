export type PrivacyControllerIdentity = {
  legalName: string;
  postalAddress: string;
  representative: string | null;
  dpoEmail: string | null;
};

export function getPrivacyControllerIdentity(
  env: NodeJS.ProcessEnv = process.env
): PrivacyControllerIdentity {
  const legalName = env.COMPANY_LEGAL_NAME?.trim();
  const postalAddress = env.COMPANY_POSTAL_ADDRESS?.trim();
  const production = env.NODE_ENV === "production"
    || env.APP_ENV === "production"
    || env.VERCEL_ENV === "production";

  if (production && (!legalName || !postalAddress)) {
    throw new Error(
      "COMPANY_LEGAL_NAME and COMPANY_POSTAL_ADDRESS are required on the production privacy policy."
    );
  }

  return {
    legalName: legalName || "SpeakAce AI — development configuration",
    postalAddress: postalAddress || "Production postal address must be configured before launch",
    representative: env.PRIVACY_EU_REPRESENTATIVE?.trim() || null,
    dpoEmail: env.PRIVACY_DPO_EMAIL?.trim() || null
  };
}
