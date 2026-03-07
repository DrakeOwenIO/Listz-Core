import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL (set it in .env)");
}

// One shared pool for the whole app (recommended pattern).
export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10, // reasonable dev default
});

// Optional helper (nice for testing + typing)
export async function dbPing(): Promise<number> {
  const res = await pool.query<{ one: number }>("SELECT 1 AS one;");
  return res.rows[0].one;
}
