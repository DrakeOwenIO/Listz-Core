import { pool } from "../db/pool";

export type ItemRow = {
  id: string;
  list_id: string;
  title: string;
  is_done: boolean;
  created_at: Date;
};

export async function createItemRow(
  listId: string,
  title: string
): Promise<ItemRow> {
  const res = await pool.query<ItemRow>(
    `
    INSERT INTO items (list_id, title)
    VALUES ($1, $2)
    RETURNING id, list_id, title, is_done, created_at;
    `,
    [listId, title]
  );

  return res.rows[0];
}

export async function getItemRowsByListId(listId: string): Promise<ItemRow[]> {
  const res = await pool.query<ItemRow>(
    `
    SELECT id, list_id, title, is_done, created_at
    FROM items
    WHERE list_id = $1
    ORDER BY created_at DESC;
    `,
    [listId]
  );

  return res.rows;
}