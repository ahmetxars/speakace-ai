import { getSql, hasDatabaseUrl } from "@/lib/server/db";

export const SCORE_DIAGNOSTIC_MAGNET = "ielts-speaking-score-diagnostic";

export const LEAD_NURTURE_SCHEDULE = [
  { step: 1, dayOffset: 2 },
  { step: 2, dayOffset: 4 },
  { step: 3, dayOffset: 7 }
] as const;

export type MarketingLeadAttribution = {
  locale?: string;
  landingPath?: string;
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

export type MarketingLead = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  magnet: string;
  consentVersion: string;
  consentGrantedAt: string;
  consentRevokedAt: string | null;
  suppressedAt: string | null;
  suppressionReason: string | null;
  followupVerifiedAt: string | null;
  followupVerificationNonceHash: string | null;
  followupVerificationIssuedAt: string | null;
  locale: string | null;
  landingPath: string | null;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  leadMagnetSentAt: string | null;
  leadMagnetClaimedAt: string | null;
  nurtureStep: number;
  nurtureLastSentAt: string | null;
  nurtureClaimedStep: number | null;
  nurtureClaimedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketingLeadNurtureCandidate = MarketingLead & {
  nextStep: (typeof LEAD_NURTURE_SCHEDULE)[number]["step"];
};

type MarketingLeadRow = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  magnet: string;
  consent_version: string;
  consent_granted_at: string | Date;
  consent_revoked_at: string | Date | null;
  suppressed_at: string | Date | null;
  suppression_reason: string | null;
  followup_verified_at: string | Date | null;
  followup_verification_nonce_hash: string | null;
  followup_verification_issued_at: string | Date | null;
  locale: string | null;
  landing_path: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  lead_magnet_sent_at: string | Date | null;
  lead_magnet_claimed_at: string | Date | null;
  nurture_step: number;
  nurture_last_sent_at: string | Date | null;
  nurture_claimed_step: number | null;
  nurture_claimed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type MemoryLeadStore = {
  leads: Map<string, MarketingLead>;
};

let marketingLeadSchemaEnsured = false;

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";
}

function getStore(): MemoryLeadStore {
  if (isProductionRuntime()) {
    throw new Error("Marketing lead persistence requires DATABASE_URL in production.");
  }
  const globalStore = globalThis as typeof globalThis & { __speakAceMarketingLeads?: MemoryLeadStore };
  if (!globalStore.__speakAceMarketingLeads) {
    globalStore.__speakAceMarketingLeads = {
      leads: new Map()
    };
  }
  return globalStore.__speakAceMarketingLeads;
}

function toIso(value: string | Date | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapLead(row: MarketingLeadRow): MarketingLead {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    source: row.source,
    magnet: row.magnet,
    consentVersion: row.consent_version,
    consentGrantedAt: toIso(row.consent_granted_at) ?? new Date().toISOString(),
    consentRevokedAt: toIso(row.consent_revoked_at),
    suppressedAt: toIso(row.suppressed_at),
    suppressionReason: row.suppression_reason,
    followupVerifiedAt: toIso(row.followup_verified_at),
    followupVerificationNonceHash: row.followup_verification_nonce_hash,
    followupVerificationIssuedAt: toIso(row.followup_verification_issued_at),
    locale: row.locale,
    landingPath: row.landing_path,
    referrerHost: row.referrer_host,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmContent: row.utm_content,
    utmTerm: row.utm_term,
    leadMagnetSentAt: toIso(row.lead_magnet_sent_at),
    leadMagnetClaimedAt: toIso(row.lead_magnet_claimed_at),
    nurtureStep: row.nurture_step,
    nurtureLastSentAt: toIso(row.nurture_last_sent_at),
    nurtureClaimedStep: row.nurture_claimed_step,
    nurtureClaimedAt: toIso(row.nurture_claimed_at),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString()
  };
}

function optionalText(value: string | undefined, maxLength: number) {
  const normalized = value?.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength) ?? "";
  return normalized || null;
}

function normalizeSource(value: string | undefined) {
  const normalized = (value?.trim().toLowerCase() || "site")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
  return normalized || "site";
}

function normalizeMagnet(value: string | undefined) {
  const normalized = (value?.trim().toLowerCase() || SCORE_DIAGNOSTIC_MAGNET)
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return normalized || SCORE_DIAGNOSTIC_MAGNET;
}

function normalizeLocale(value: string | undefined) {
  const normalized = value?.trim().slice(0, 12) ?? "";
  return /^[a-z]{2}(?:-[A-Z]{2})?$/.test(normalized) ? normalized : null;
}

function normalizeLandingPath(value: string | undefined) {
  const normalized = value?.trim().slice(0, 300) ?? "";
  return normalized.startsWith("/") && !normalized.startsWith("//") ? normalized : null;
}

function normalizeReferrerHost(value: string | undefined) {
  const normalized = value?.trim().toLowerCase().slice(0, 255) ?? "";
  return /^[a-z0-9.-]+$/.test(normalized) ? normalized : null;
}

async function ensureMarketingLeadSchema() {
  if (!hasDatabaseUrl() || marketingLeadSchemaEnsured) return;

  const sql = getSql();
  await sql`
    create table if not exists marketing_leads (
      id text primary key,
      email text not null unique,
      name text,
      source text not null default 'site',
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    alter table marketing_leads
      add column if not exists magnet text not null default 'ielts-speaking-score-diagnostic',
      add column if not exists consent_version text not null default 'legacy-unconfirmed',
      add column if not exists consent_granted_at timestamptz,
      add column if not exists consent_revoked_at timestamptz,
      add column if not exists suppressed_at timestamptz,
      add column if not exists suppression_reason text,
      add column if not exists followup_verified_at timestamptz,
      add column if not exists followup_verification_nonce_hash text,
      add column if not exists followup_verification_issued_at timestamptz,
      add column if not exists locale text,
      add column if not exists landing_path text,
      add column if not exists referrer_host text,
      add column if not exists utm_source text,
      add column if not exists utm_medium text,
      add column if not exists utm_campaign text,
      add column if not exists utm_content text,
      add column if not exists utm_term text,
      add column if not exists lead_magnet_sent_at timestamptz,
      add column if not exists lead_magnet_claimed_at timestamptz,
      add column if not exists nurture_step integer not null default 0,
      add column if not exists nurture_last_sent_at timestamptz,
      add column if not exists nurture_claimed_step integer,
      add column if not exists nurture_claimed_at timestamptz,
      add column if not exists updated_at timestamptz not null default now()
  `;
  await sql`
    create index if not exists idx_marketing_leads_nurture_due
    on marketing_leads (nurture_step, created_at)
    where consent_granted_at is not null
      and consent_revoked_at is null
      and suppressed_at is null
  `;

  marketingLeadSchemaEnsured = true;
}

export function resolveMarketingLeadMagnet(source: string) {
  const normalized = normalizeSource(source);
  if (["schools_demo", "institution_demo"].includes(normalized)) {
    return "institution-demo";
  }
  if (["teachers_demo", "teacher_demo"].includes(normalized)) {
    return "teacher-walkthrough";
  }
  return SCORE_DIAGNOSTIC_MAGNET;
}

export function isMarketingLeadPersistenceAvailable() {
  return hasDatabaseUrl() || !isProductionRuntime();
}

export function resolveMarketingLeadConsentVersion(magnet: string) {
  if (magnet === "institution-demo") return "institution-demo-followup-v1";
  if (magnet === "teacher-walkthrough") return "teacher-walkthrough-followup-v1";
  return "ielts-score-diagnostic-nurture-v1";
}

export async function createMarketingLead(input: {
  email: string;
  name?: string;
  source?: string;
  magnet?: string;
  consent: true;
  consentVersion: string;
  attribution?: MarketingLeadAttribution;
}) {
  const now = new Date().toISOString();
  const email = input.email.trim().toLowerCase().slice(0, 320);
  const name = optionalText(input.name, 120);
  const source = normalizeSource(input.source);
  const magnet = normalizeMagnet(input.magnet);
  const consentVersion = optionalText(input.consentVersion, 100) ?? "explicit-v1";
  const attribution = input.attribution ?? {};
  const locale = normalizeLocale(attribution.locale);
  const landingPath = normalizeLandingPath(attribution.landingPath);
  const referrerHost = normalizeReferrerHost(attribution.referrerHost);
  const utmSource = optionalText(attribution.utmSource, 160);
  const utmMedium = optionalText(attribution.utmMedium, 160);
  const utmCampaign = optionalText(attribution.utmCampaign, 200);
  const utmContent = optionalText(attribution.utmContent, 200);
  const utmTerm = optionalText(attribution.utmTerm, 200);

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<MarketingLeadRow[]>`
      insert into marketing_leads (
        id,
        email,
        name,
        source,
        magnet,
        consent_version,
        consent_granted_at,
        consent_revoked_at,
        locale,
        landing_path,
        referrer_host,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        created_at,
        updated_at
      )
      values (
        ${crypto.randomUUID()},
        ${email},
        ${name},
        ${source},
        ${magnet},
        ${consentVersion},
        ${now},
        ${null},
        ${locale},
        ${landingPath},
        ${referrerHost},
        ${utmSource},
        ${utmMedium},
        ${utmCampaign},
        ${utmContent},
        ${utmTerm},
        ${now},
        ${now}
      )
      on conflict (email)
      do update set
        email = marketing_leads.email
      returning *
    `;
    return mapLead(rows[0]);
  }

  const store = getStore();
  const existing = store.leads.get(email);
  // Public forms are intentionally create-once per address. Repeated anonymous
  // submissions must not rewrite the name, attribution, magnet, consent epoch,
  // or an unsubscribe decision for an existing recipient.
  if (existing) return existing;

  const next: MarketingLead = {
    id: crypto.randomUUID(),
    email,
    name,
    source,
    magnet,
    consentVersion,
    consentGrantedAt: now,
    consentRevokedAt: null,
    suppressedAt: null,
    suppressionReason: null,
    followupVerifiedAt: null,
    followupVerificationNonceHash: null,
    followupVerificationIssuedAt: null,
    locale,
    landingPath,
    referrerHost,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    leadMagnetSentAt: null,
    leadMagnetClaimedAt: null,
    nurtureStep: 0,
    nurtureLastSentAt: null,
    nurtureClaimedStep: null,
    nurtureClaimedAt: null,
    createdAt: now,
    updatedAt: now
  };
  store.leads.set(email, next);
  return next;
}

export async function getMarketingLeadsPendingGuide(limit = 100): Promise<MarketingLead[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 500);
  const staleClaimAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<MarketingLeadRow[]>`
      select ml.*
      from marketing_leads ml
      where ml.consent_granted_at is not null
        and ml.consent_revoked_at is null
        and ml.suppressed_at is null
        and ml.lead_magnet_sent_at is null
        and (
          ml.lead_magnet_claimed_at is null
          or ml.lead_magnet_claimed_at < ${staleClaimAt}
        )
        and not exists (
          select 1
          from users u
          where lower(u.email) = ml.email
            and u.email_opt_out = true
        )
      order by ml.created_at asc
      limit ${safeLimit}
    `;
    return rows.map(mapLead);
  }

  return Array.from(getStore().leads.values())
    .filter((lead) => (
      Boolean(lead.consentGrantedAt) &&
      !lead.consentRevokedAt &&
      !lead.suppressedAt &&
      !lead.leadMagnetSentAt &&
      (!lead.leadMagnetClaimedAt || lead.leadMagnetClaimedAt < staleClaimAt)
    ))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, safeLimit);
}

export async function claimMarketingLeadGuide(leadId: string): Promise<MarketingLead | null> {
  const now = new Date().toISOString();
  const staleClaimAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<MarketingLeadRow[]>`
      update marketing_leads ml
      set lead_magnet_claimed_at = ${now}, updated_at = ${now}
      where ml.id = ${leadId}
        and ml.consent_granted_at is not null
        and ml.consent_revoked_at is null
        and ml.suppressed_at is null
        and ml.lead_magnet_sent_at is null
        and (
          ml.lead_magnet_claimed_at is null
          or ml.lead_magnet_claimed_at < ${staleClaimAt}
        )
        and not exists (
          select 1
          from users u
          where lower(u.email) = ml.email
            and u.email_opt_out = true
        )
      returning ml.*
    `;
    return rows[0] ? mapLead(rows[0]) : null;
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === leadId);
  if (
    !lead ||
    lead.consentRevokedAt ||
    lead.suppressedAt ||
    lead.leadMagnetSentAt ||
    (lead.leadMagnetClaimedAt && lead.leadMagnetClaimedAt >= staleClaimAt)
  ) {
    return null;
  }
  const claimed = { ...lead, leadMagnetClaimedAt: now, updatedAt: now };
  store.leads.set(claimed.email, claimed);
  return claimed;
}

export async function completeMarketingLeadGuide(leadId: string, sent: boolean) {
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    await sql`
      update marketing_leads
      set
        lead_magnet_sent_at = case when ${sent} then ${now} else lead_magnet_sent_at end,
        lead_magnet_claimed_at = null,
        updated_at = ${now}
      where id = ${leadId}
    `;
    return;
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === leadId);
  if (!lead) return;
  store.leads.set(lead.email, {
    ...lead,
    leadMagnetSentAt: sent ? now : lead.leadMagnetSentAt,
    leadMagnetClaimedAt: null,
    updatedAt: now
  });
}

export async function setMarketingLeadFollowupVerification(input: {
  leadId: string;
  nonceHash: string;
  issuedAt: string;
}) {
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<Array<{ id: string }>>`
      update marketing_leads
      set
        followup_verified_at = case
          when followup_verification_nonce_hash = ${input.nonceHash}
            and followup_verification_issued_at = ${input.issuedAt}
          then followup_verified_at
          else null
        end,
        followup_verification_nonce_hash = ${input.nonceHash},
        followup_verification_issued_at = ${input.issuedAt},
        updated_at = ${now}
      where id = ${input.leadId}
        and magnet = ${SCORE_DIAGNOSTIC_MAGNET}
        and consent_granted_at is not null
        and consent_revoked_at is null
        and suppressed_at is null
        and lead_magnet_sent_at is null
        and lead_magnet_claimed_at is not null
      returning id
    `;
    return Boolean(rows[0]);
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === input.leadId);
  if (
    !lead ||
    lead.magnet !== SCORE_DIAGNOSTIC_MAGNET ||
    lead.consentRevokedAt ||
    lead.suppressedAt ||
    lead.leadMagnetSentAt ||
    !lead.leadMagnetClaimedAt
  ) {
    return false;
  }
  store.leads.set(lead.email, {
    ...lead,
    followupVerifiedAt:
      lead.followupVerificationNonceHash === input.nonceHash &&
      lead.followupVerificationIssuedAt === input.issuedAt
        ? lead.followupVerifiedAt
        : null,
    followupVerificationNonceHash: input.nonceHash,
    followupVerificationIssuedAt: input.issuedAt,
    updatedAt: now
  });
  return true;
}

export async function confirmMarketingLeadFollowup(input: {
  leadId: string;
  nonceHash: string;
  issuedAt: string;
}) {
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<Array<{ followup_verified_at: string | Date }>>`
      update marketing_leads
      set
        followup_verified_at = coalesce(followup_verified_at, ${now}),
        lead_magnet_sent_at = coalesce(lead_magnet_sent_at, ${now}),
        lead_magnet_claimed_at = null,
        updated_at = ${now}
      where id = ${input.leadId}
        and magnet = ${SCORE_DIAGNOSTIC_MAGNET}
        and consent_granted_at is not null
        and consent_revoked_at is null
        and suppressed_at is null
        and followup_verification_nonce_hash = ${input.nonceHash}
        and followup_verification_issued_at = ${input.issuedAt}
      returning followup_verified_at
    `;
    return rows[0] ? { ok: true as const, verifiedAt: toIso(rows[0].followup_verified_at) } : { ok: false as const };
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === input.leadId);
  if (
    !lead ||
    lead.magnet !== SCORE_DIAGNOSTIC_MAGNET ||
    lead.consentRevokedAt ||
    lead.suppressedAt ||
    lead.followupVerificationNonceHash !== input.nonceHash ||
    lead.followupVerificationIssuedAt !== input.issuedAt
  ) {
    return { ok: false as const };
  }
  const verifiedAt = lead.followupVerifiedAt ?? now;
  store.leads.set(lead.email, {
    ...lead,
    followupVerifiedAt: verifiedAt,
    leadMagnetSentAt: lead.leadMagnetSentAt ?? now,
    leadMagnetClaimedAt: null,
    updatedAt: now
  });
  return { ok: true as const, verifiedAt };
}

export async function getMarketingLeadsDueForNurture(
  limit = 100,
  now = new Date()
): Promise<MarketingLeadNurtureCandidate[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 500);
  const staleClaimAt = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  let leads: MarketingLead[];

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<MarketingLeadRow[]>`
      select ml.*
      from marketing_leads ml
      where ml.magnet = ${SCORE_DIAGNOSTIC_MAGNET}
        and ml.consent_granted_at is not null
        and ml.consent_revoked_at is null
        and ml.suppressed_at is null
        and ml.followup_verified_at is not null
        and ml.lead_magnet_sent_at is not null
        and ml.nurture_step < ${LEAD_NURTURE_SCHEDULE.length}
        and (
          ml.nurture_claimed_at is null
          or ml.nurture_claimed_at < ${staleClaimAt}
        )
        and not exists (
          select 1
          from users u
          where lower(u.email) = ml.email
        )
      order by ml.followup_verified_at asc
      limit ${safeLimit * 4}
    `;
    leads = rows.map(mapLead);
  } else {
    leads = Array.from(getStore().leads.values()).filter((lead) => (
      lead.magnet === SCORE_DIAGNOSTIC_MAGNET &&
      Boolean(lead.consentGrantedAt) &&
      !lead.consentRevokedAt &&
      !lead.suppressedAt &&
      Boolean(lead.followupVerifiedAt) &&
      Boolean(lead.leadMagnetSentAt) &&
      lead.nurtureStep < LEAD_NURTURE_SCHEDULE.length &&
      (!lead.nurtureClaimedAt || lead.nurtureClaimedAt < staleClaimAt)
    ));
  }

  return leads
    .map((lead) => {
      const next = LEAD_NURTURE_SCHEDULE.find((step) => step.step === lead.nurtureStep + 1);
      if (!next || !lead.followupVerifiedAt) return null;
      const dueAt = new Date(lead.followupVerifiedAt);
      dueAt.setUTCDate(dueAt.getUTCDate() + next.dayOffset);
      if (dueAt.getTime() > now.getTime()) return null;
      return { ...lead, nextStep: next.step };
    })
    .filter((lead): lead is MarketingLeadNurtureCandidate => Boolean(lead))
    .sort((a, b) => (a.followupVerifiedAt ?? "").localeCompare(b.followupVerifiedAt ?? ""))
    .slice(0, safeLimit);
}

export async function claimMarketingLeadNurtureStep(
  leadId: string,
  step: MarketingLeadNurtureCandidate["nextStep"]
): Promise<MarketingLead | null> {
  const now = new Date().toISOString();
  const staleClaimAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    const rows = await sql<MarketingLeadRow[]>`
      update marketing_leads ml
      set
        nurture_claimed_step = ${step},
        nurture_claimed_at = ${now},
        updated_at = ${now}
      where ml.id = ${leadId}
        and ml.magnet = ${SCORE_DIAGNOSTIC_MAGNET}
        and ml.nurture_step = ${step - 1}
        and ml.consent_granted_at is not null
        and ml.consent_revoked_at is null
        and ml.suppressed_at is null
        and ml.followup_verified_at is not null
        and (
          ml.nurture_claimed_at is null
          or ml.nurture_claimed_at < ${staleClaimAt}
        )
        and not exists (
          select 1
          from users u
          where lower(u.email) = ml.email
        )
      returning ml.*
    `;
    return rows[0] ? mapLead(rows[0]) : null;
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === leadId);
  if (
    !lead ||
    lead.magnet !== SCORE_DIAGNOSTIC_MAGNET ||
    lead.nurtureStep !== step - 1 ||
    lead.consentRevokedAt ||
    lead.suppressedAt ||
    !lead.followupVerifiedAt ||
    (lead.nurtureClaimedAt && lead.nurtureClaimedAt >= staleClaimAt)
  ) {
    return null;
  }
  const claimed = {
    ...lead,
    nurtureClaimedStep: step,
    nurtureClaimedAt: now,
    updatedAt: now
  };
  store.leads.set(claimed.email, claimed);
  return claimed;
}

export async function completeMarketingLeadNurtureStep(
  leadId: string,
  step: MarketingLeadNurtureCandidate["nextStep"],
  sent: boolean
) {
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    await sql`
      update marketing_leads
      set
        nurture_step = case when ${sent} then greatest(nurture_step, ${step}) else nurture_step end,
        nurture_last_sent_at = case when ${sent} then ${now} else nurture_last_sent_at end,
        nurture_claimed_step = null,
        nurture_claimed_at = null,
        updated_at = ${now}
      where id = ${leadId}
        and nurture_claimed_step = ${step}
    `;
    return;
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === leadId);
  if (!lead || lead.nurtureClaimedStep !== step) return;
  store.leads.set(lead.email, {
    ...lead,
    nurtureStep: sent ? Math.max(lead.nurtureStep, step) : lead.nurtureStep,
    nurtureLastSentAt: sent ? now : lead.nurtureLastSentAt,
    nurtureClaimedStep: null,
    nurtureClaimedAt: null,
    updatedAt: now
  });
}

export async function revokeMarketingLeadConsent(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    await sql`
      update marketing_leads
      set
        consent_revoked_at = ${now},
        name = null,
        locale = null,
        landing_path = null,
        referrer_host = null,
        utm_source = null,
        utm_medium = null,
        utm_campaign = null,
        utm_content = null,
        utm_term = null,
        followup_verified_at = null,
        followup_verification_nonce_hash = null,
        followup_verification_issued_at = null,
        lead_magnet_claimed_at = null,
        nurture_claimed_step = null,
        nurture_claimed_at = null,
        updated_at = ${now}
      where email = ${email}
    `;
    return;
  }

  const store = getStore();
  const lead = store.leads.get(email);
  if (!lead) return;
  store.leads.set(email, {
    ...lead,
    consentRevokedAt: now,
    name: null,
    locale: null,
    landingPath: null,
    referrerHost: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    followupVerifiedAt: null,
    followupVerificationNonceHash: null,
    followupVerificationIssuedAt: null,
    leadMagnetClaimedAt: null,
    nurtureClaimedStep: null,
    nurtureClaimedAt: null,
    updatedAt: now
  });
}

/**
 * Applies a signed unsubscribe to both anonymous lead and account email state.
 * In database mode both writes commit together, so the API never reports a
 * successful opt-out after only one side was updated.
 */
export async function revokeMarketingConsentEverywhere(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    await sql.begin(async (transaction) => {
      const transactionSql = transaction as unknown as ReturnType<typeof getSql>;
      await transactionSql`
        update marketing_leads
        set
          consent_revoked_at = ${now},
          name = null,
          locale = null,
          landing_path = null,
          referrer_host = null,
          utm_source = null,
          utm_medium = null,
          utm_campaign = null,
          utm_content = null,
          utm_term = null,
          followup_verified_at = null,
          followup_verification_nonce_hash = null,
          followup_verification_issued_at = null,
          lead_magnet_claimed_at = null,
          nurture_claimed_step = null,
          nurture_claimed_at = null,
          updated_at = ${now}
        where email = ${email}
      `;
      await transactionSql`
        update users
        set email_opt_out = true
        where lower(email) = ${email}
      `;
    });
    return;
  }

  await revokeMarketingLeadConsent(email);
}

export async function pruneMarketingLeadData(now = new Date()) {
  const nowIso = now.toISOString();
  const unconfirmedCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const completedCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const deliveryAuditCutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    return sql.begin(async (transaction) => {
      const transactionSql = transaction as unknown as ReturnType<typeof getSql>;
      const minimized = await transactionSql<Array<{ id: string }>>`
        update marketing_leads
        set
          consent_revoked_at = ${nowIso},
          name = null,
          locale = null,
          landing_path = null,
          referrer_host = null,
          utm_source = null,
          utm_medium = null,
          utm_campaign = null,
          utm_content = null,
          utm_term = null,
          followup_verified_at = null,
          followup_verification_nonce_hash = null,
          followup_verification_issued_at = null,
          lead_magnet_claimed_at = null,
          nurture_claimed_step = null,
          nurture_claimed_at = null,
          updated_at = ${nowIso}
        where consent_revoked_at is null
          and (
            (followup_verified_at is null and created_at < ${unconfirmedCutoff})
            or (
              nurture_step >= ${LEAD_NURTURE_SCHEDULE.length}
              and nurture_last_sent_at is not null
              and nurture_last_sent_at < ${completedCutoff}
            )
          )
        returning id
      `;
      const deletedAuditRows = await transactionSql<Array<{ id: string }>>`
        delete from email_log
        where template like 'marketing_lead_%'
          and sent_at < ${deliveryAuditCutoff}
        returning id
      `;
      return {
        leadsMinimized: minimized.length,
        deliveryAuditRowsDeleted: deletedAuditRows.length
      };
    });
  }

  const store = getStore();
  let leadsMinimized = 0;
  for (const [email, lead] of store.leads.entries()) {
    const unconfirmedExpired = !lead.followupVerifiedAt && lead.createdAt < unconfirmedCutoff;
    const completedExpired =
      lead.nurtureStep >= LEAD_NURTURE_SCHEDULE.length &&
      Boolean(lead.nurtureLastSentAt && lead.nurtureLastSentAt < completedCutoff);
    if (lead.consentRevokedAt || (!unconfirmedExpired && !completedExpired)) continue;
    store.leads.set(email, {
      ...lead,
      consentRevokedAt: nowIso,
      name: null,
      locale: null,
      landingPath: null,
      referrerHost: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      followupVerifiedAt: null,
      followupVerificationNonceHash: null,
      followupVerificationIssuedAt: null,
      leadMagnetClaimedAt: null,
      nurtureClaimedStep: null,
      nurtureClaimedAt: null,
      updatedAt: nowIso
    });
    leadsMinimized++;
  }
  return { leadsMinimized, deliveryAuditRowsDeleted: 0 };
}

export async function suppressMarketingLead(leadId: string, reason: string) {
  const now = new Date().toISOString();
  const safeReason = optionalText(reason, 300) ?? "provider_suppression";

  if (hasDatabaseUrl()) {
    await ensureMarketingLeadSchema();
    const sql = getSql();
    await sql`
      update marketing_leads
      set
        suppressed_at = ${now},
        suppression_reason = ${safeReason},
        followup_verified_at = null,
        followup_verification_nonce_hash = null,
        followup_verification_issued_at = null,
        lead_magnet_claimed_at = null,
        nurture_claimed_step = null,
        nurture_claimed_at = null,
        updated_at = ${now}
      where id = ${leadId}
    `;
    return;
  }

  const store = getStore();
  const lead = Array.from(store.leads.values()).find((candidate) => candidate.id === leadId);
  if (!lead) return;
  store.leads.set(lead.email, {
    ...lead,
    suppressedAt: now,
    suppressionReason: safeReason,
    followupVerifiedAt: null,
    followupVerificationNonceHash: null,
    followupVerificationIssuedAt: null,
    leadMagnetClaimedAt: null,
    nurtureClaimedStep: null,
    nurtureClaimedAt: null,
    updatedAt: now
  });
}

export function resetMarketingLeadMemoryStoreForTests() {
  getStore().leads.clear();
}
