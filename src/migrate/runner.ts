import fs from "node:fs";
import path from "node:path";
import { pool } from "../core/db/pool";

type AppliedRow = { version: string };

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedVersions(): Promise<Set<string>> {
  const res = await pool.query<AppliedRow>(`SELECT version FROM schema_migrations;`);
  return new Set(res.rows.map(r => r.version));
}

function getMigrationFiles(): string[] {
  // migrations folder is at src/migrations
  const migrationsDir = path.resolve(process.cwd(), "src", "migrations");

  if (!fs.existsSync(migrationsDir)) return [];

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // relies on 001_, 002_ naming

  return files.map((f) => path.join(migrationsDir, f));
}

async function applyMigration(version: string, sql: string) {
  // One transaction per migration
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      `INSERT INTO schema_migrations (version) VALUES ($1);`,
      [version]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function runMigrations(): Promise<{ applied: string[] }> {
  await ensureMigrationsTable();

  const applied = await getAppliedVersions();
  const files = getMigrationFiles();

  const appliedNow: string[] = [];

  for (const filePath of files) {
    const version = path.basename(filePath); // e.g. "001_init.sql"
    if (applied.has(version)) continue;

    const sql = fs.readFileSync(filePath, "utf8");
    await applyMigration(version, sql);
    appliedNow.push(version);
  }

  return { applied: appliedNow };
}
