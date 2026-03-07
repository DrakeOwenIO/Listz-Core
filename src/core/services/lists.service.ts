import type { List } from "../domain/models";
import { createListRow, getListRows } from "../repos/lists.repo";

function normalizeName(name: string): string {
  return name.trim();
}

export async function createList(name: string): Promise<List> {
  const normalized = normalizeName(name);

  if (!normalized) {
    throw new Error("List name cannot be empty.");
  }

  const row = await createListRow(normalized);

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export async function listLists(): Promise<List[]> {
  const rows = await getListRows();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }));
}