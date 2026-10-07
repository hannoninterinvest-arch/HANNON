import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { HttpError } from "./http";
import { applySchema } from "./schema";
import { seed } from "./seed";

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function connectionString() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new HttpError(
      500,
      "La base PostgreSQL n'est pas configurée. Ajoutez DATABASE_URL dans les variables d'environnement Vercel.",
    );
  }
  const url = new URL(raw);
  url.searchParams.delete("channel_binding");
  url.searchParams.delete("sslmode");
  return url.toString();
}

export function getPool() {
  if (!pool) {
    const connection = connectionString();
    const local = /localhost|127\.0\.0\.1/.test(connection);
    pool = new Pool({
      connectionString: connection,
      max: 1,
      ssl: local ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export async function ensureReady() {
  if (!ready) {
    ready = prepare().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function prepare() {
  const client = await getPool().connect();
  try {
    await client.query("SELECT pg_advisory_lock(842017)");
    await applySchema(client);
    await seed(client);
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock(842017)");
    } catch {
      // The session ends with release if unlock fails.
    }
    client.release();
  }
}

export type Db = Pick<PoolClient, "query">;
