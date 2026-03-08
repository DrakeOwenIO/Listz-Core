import { pool } from "../db/pool";

export type ListRow = {
  id: string;
  name: string;
  created_at: Date;
};

export async function createListRow(name: string): Promise<ListRow> {
  const res = await pool.query<ListRow>(
    `
    INSERT INTO lists (name)
    VALUES ($1)
    RETURNING id, name, created_at;
    `,
    [name]
  );

  return res.rows[0];
}

export async function getListRows(): Promise<ListRow[]> {
  const res = await pool.query<ListRow>(
    `
    SELECT id, name, created_at
    FROM lists
    ORDER BY created_at DESC;
    `
  );

  return res.rows;
}

export async function getListRowById(id: string): Promise<ListRow | null> {
    const res = await pool.query<ListRow>(
      `
      SELECT id, name, created_at
      FROM lists
      WHERE id = $1;
      `,
      [id]
    );
  
    return res.rows[0] ?? null;
  }