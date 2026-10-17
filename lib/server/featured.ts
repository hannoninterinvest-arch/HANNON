import { getPool, one } from "./db";
import { HttpError, isUuid } from "./http";

export const FEATURED_LIMITS = { projects: 3, services: 6 } as const;

type Table = keyof typeof FEATURED_LIMITS;

export async function assertFeaturedRoom(table: Table, excludeId: string | null) {
  const row = await one(
    `SELECT count(*)::int AS count FROM ${table} WHERE featured = true AND ($1::uuid IS NULL OR id <> $1)`,
    [excludeId],
  );
  const limit = FEATURED_LIMITS[table];
  if (Number(row?.count ?? 0) >= limit) {
    throw new HttpError(
      400,
      `The home page shows at most ${limit} ${table}. Remove another one from the home page first.`,
    );
  }
}

export async function reorder(table: Table, body: Record<string, unknown>) {
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  if (!ids.length || ids.length > 500 || !ids.every(isUuid) || new Set(ids).size !== ids.length) {
    throw new HttpError(400, "The list of identifiers is invalid.");
  }
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE ${table} t SET "sortOrder" = v.ord::int - 1
       FROM unnest($1::uuid[]) WITH ORDINALITY AS v(id, ord)
       WHERE t.id = v.id`,
      [ids],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
  return { ok: true };
}
