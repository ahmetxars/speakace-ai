export type PrivacyControllerIdentity = {
  legalName: string;
  postalAddress: string | null;
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

  if (production && !legalName) {
    throw new Error(
      "COMPANY_LEGAL_NAME is required on the production privacy policy."
    );
  }

  return {
    legalName: legalName || "SpeakAce AI — development configuration",
    postalAddress: postalAddress || null,
    representative: env.PRIVACY_EU_REPRESENTATIVE?.trim() || null,
    dpoEmail: env.PRIVACY_DPO_EMAIL?.trim() || null
  };
}
