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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(input: { key: string; windowMs: number; max: number }) {
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
