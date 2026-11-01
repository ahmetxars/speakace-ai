-- Additive migration. Existing users receive no inferred consent.
begin;
alter table users
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_acknowledged_at timestamptz,
  add column if not exists legal_version text,
  add column if not exists marketing_consent_at timestamptz;
commit;
