import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type MemoryRateLimitStore = Map<string, RateLimitBucket>;

function getStore(): MemoryRateLimitStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceRateLimits?: MemoryRateLimitStore };
  if (!globalStore.__speakAceRateLimits) {
    globalStore.__speakAceRateLimits = new Map();
  }
  return globalStore.__speakAceRateLimits;
}

export function getRequestIp(request: Request) {
  // Vercel overwrites this header at the edge, while a proxy in front of
  // Vercel may rewrite the generic X-Forwarded-For header.
  const candidate =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for") ??
    "";
  const first = candidate.split(",")[0]?.trim().replace(/^\[|\]$/g, "") ?? "";
  return isIP(first) ? first : "unknown";
}

export function rateLimitResponse(retryAfterSeconds: number, message = "Too many requests. Please try again later.") {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSeconds)
    }
  });
}

type RateLimitInput = { key: string; windowMs: number; max: number };

export function checkRateLimit(input: RateLimitInput) {
  const store = getStore();
  const now = Date.now();
  const current = store.get(input.key);

  if (!current || current.resetAt <= now) {
    store.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= input.max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1)
    };
  }

  current.count += 1;
  store.set(input.key, current);
  return { allowed: true, retryAfterSeconds: 0 };
}
type SharedRateLimit = { allowed: boolean; retryAfterSeconds: number; unavailable?: boolean };

let schemaReady: Promise<void> | undefined;
let nextCleanupAt = 0;

function ensureSharedRateLimitSchema(sql: ReturnType<typeof getSql>) {
  return schemaReady ??= (async () => {
    const [existing] = await sql`select to_regclass('request_rate_limits') as name`;
    if (existing?.name) return;
    await sql.begin(async (transaction) => {
      const tx = transaction as unknown as typeof sql;
      await tx`select pg_advisory_xact_lock(384916208)`;
      await tx`create table if not exists request_rate_limits (
        key_hash text primary key,
        hits integer not null,
        expires_at timestamptz not null
      )`;
      await tx`create index if not exists request_rate_limits_expires_at_idx on request_rate_limits (expires_at)`;
    });
  })().catch((error) => {
    schemaReady = undefined;
    throw error;
  });
}

export async function checkSharedRateLimit(...inputs: RateLimitInput[]): Promise<SharedRateLimit> {
  try {
    if (!hasDatabaseUrl()) {
      if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") {
        return { allowed: false, retryAfterSeconds: 60, unavailable: true };
      }
      for (const input of inputs) {
        const limit = checkRateLimit(input);
        if (!limit.allowed) return limit;
      }
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const sql = getSql();
    await ensureSharedRateLimitSchema(sql);
    if (nextCleanupAt <= Date.now()) {
      nextCleanupAt = Date.now() + 60_000;
      await sql`
        delete from request_rate_limits where key_hash in (
          select key_hash from request_rate_limits where expires_at <= now()
          order by expires_at limit 1000 for update skip locked
        )
      `;
    }

    for (const input of inputs) {
      const keyHash = createHash("sha256").update(input.key).digest("hex");
      const [updated] = await sql`
        insert into request_rate_limits (key_hash, hits, expires_at)
        values (${keyHash}, 1, now() + ${input.windowMs}::bigint * interval '1 millisecond')
        on conflict (key_hash) do update set
          hits = case when request_rate_limits.expires_at <= now() then 1 else request_rate_limits.hits + 1 end,
          expires_at = case when request_rate_limits.expires_at <= now() then excluded.expires_at else request_rate_limits.expires_at end
        where request_rate_limits.expires_at <= now() or request_rate_limits.hits < ${input.max}
        returning hits
      `;
      if (!updated) {
        const [bucket] = await sql<Array<{ seconds: number }>>`
          select greatest(1, ceil(extract(epoch from (expires_at - now()))))::int as seconds
          from request_rate_limits where key_hash = ${keyHash}
        `;
        return { allowed: false, retryAfterSeconds: bucket?.seconds ?? 1 };
      }
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    console.error("Shared request limits unavailable");
    return { allowed: false, retryAfterSeconds: 60, unavailable: true };
  }
}

export function sharedRateLimitResponse(limit: SharedRateLimit, message?: string) {
  if (limit.unavailable) {
    return Response.json({ error: "Request limits are temporarily unavailable. Please try again later." }, {
      status: 503,
      headers: { "Retry-After": String(limit.retryAfterSeconds) }
    });
  }
  return rateLimitResponse(limit.retryAfterSeconds, message);
}
