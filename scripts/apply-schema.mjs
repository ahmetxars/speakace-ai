import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");
const schemaPath = path.join(cwd, "db", "schema.sql");

async function loadEnvFile() {
  try {
    const contents = await fs.readFile(envPath, "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional; environment variables may already be provided by the shell.
  }
}

async function main() {
  await loadEnvFile();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local or your shell before running db:push.");
  }

  const schemaSql = await fs.readFile(schemaPath, "utf8");
  const sql = postgres(connectionString, {
    ssl: "require",
    prepare: false,
    max: 1
  });

  try {
    await sql.unsafe(schemaSql);
    console.log("Schema applied successfully.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
