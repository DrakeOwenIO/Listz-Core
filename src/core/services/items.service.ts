import type { Item } from "../domain/models";
import { getListRowById } from "../repos/lists.repo";
import { createItemRow, getItemRowsByListId } from "../repos/items.repo";

function normalizeTitle(title: string): string {
  return title.trim();
}

export async function addItem(listId: string, title: string): Promise<Item> {
  const normalized = normalizeTitle(title);

  if (!normalized) {
    throw new Error("Item title cannot be empty.");
  }

  const list = await getListRowById(listId);

  if (!list) {
    throw new Error(`List not found: ${listId}`);
  }

  const row = await createItemRow(listId, normalized);

  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    isDone: row.is_done,
    createdAt: row.created_at,
  };
}

export async function listItems(listId: string): Promise<Item[]> {
  const list = await getListRowById(listId);

  if (!list) {
    throw new Error(`List not found: ${listId}`);
  }

  const rows = await getItemRowsByListId(listId);

  return rows.map((row) => ({
    id: row.id,
    listId: row.list_id,
    title: row.title,
    isDone: row.is_done,
    createdAt: row.created_at,
  }));
}