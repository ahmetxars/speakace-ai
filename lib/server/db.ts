import postgres, { type Sql } from "postgres";

declare global {
  var __speakAceSql: Sql | undefined;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.__speakAceSql) {
    globalThis.__speakAceSql = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      prepare: false,
      max: 1
    });
  }

  return globalThis.__speakAceSql;
}
