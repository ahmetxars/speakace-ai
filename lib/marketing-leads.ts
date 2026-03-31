import { getSql, hasDatabaseUrl } from "@/lib/server/db";

type MarketingLead = {
  id: string;
  email: string;
  name?: string | null;
  source: string;
  createdAt: string;
};

type MemoryLeadStore = {
  leads: Map<string, MarketingLead>;
};

function getStore(): MemoryLeadStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceMarketingLeads?: MemoryLeadStore };
  if (!globalStore.__speakAceMarketingLeads) {
    globalStore.__speakAceMarketingLeads = {
      leads: new Map()
    };
  }
  return globalStore.__speakAceMarketingLeads;
}

export async function createMarketingLead(input: {
  email: string;
  name?: string;
  source?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const source = input.source?.trim() || "site";

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = (await sql`
      insert into marketing_leads (id, email, name, source, created_at)
      values (${crypto.randomUUID()}, ${email}, ${name}, ${source}, ${new Date().toISOString()})
      on conflict (email)
      do update set
        name = coalesce(excluded.name, marketing_leads.name),
        source = excluded.source
      returning
        id,
        email,
        name,
        source,
        created_at as "createdAt"
    `) as unknown as MarketingLead[];
    return rows[0];
  }

  const store = getStore();
  const existing = store.leads.get(email);
  const next: MarketingLead = existing
    ? { ...existing, name: name ?? existing.name, source }
    : {
        id: crypto.randomUUID(),
        email,
        name,
        source,
        createdAt: new Date().toISOString()
      };
  store.leads.set(email, next);
  return next;
}
