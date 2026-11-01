import { getSql, hasDatabaseUrl } from "@/lib/server/db";
let schemaReady: Promise<void> | undefined;
export async function ensureAccountConsentSchema() {
  if (!hasDatabaseUrl()) return;
  if (!schemaReady)
    schemaReady = (async () => {
      await getSql()`alter table users
      add column if not exists terms_accepted_at timestamptz,
      add column if not exists privacy_acknowledged_at timestamptz,
      add column if not exists legal_version text,
      add column if not exists marketing_consent_at timestamptz`;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  await schemaReady;
}
