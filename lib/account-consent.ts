export const ACCOUNT_LEGAL_VERSION = "2026-11-01";
export type AccountConsent = {
  legalAccepted?: boolean;
  marketingConsent?: boolean;
};
export function hasRequiredAccountConsent(input: {
  termsAccepted?: unknown;
  privacyAcknowledged?: unknown;
  legalVersion?: unknown;
}) {
  return (
    input.termsAccepted === true &&
    input.privacyAcknowledged === true &&
    input.legalVersion === ACCOUNT_LEGAL_VERSION
  );
}
