import dns from "dns";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { HttpError } from "./http";
import { applySchema } from "./schema";
import { seed } from "./seed";

dns.setDefaultResultOrder("ipv4first");

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function databaseConfig() {
  const raw = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (!raw) {
    throw new HttpError(
      500,
      "La base PostgreSQL n'est pas configurée. Ajoutez DATABASE_URL dans les variables d'environnement Vercel.",
    );
  }
  const local = /localhost|127\.0\.0\.1/.test(raw);
  let url = raw
    .replace(/([?&])channel_binding=[^&]*/g, "$1")
    .replace(/\?&/g, "?")
    .replace(/&&/g, "&")
    .replace(/[?&]$/g, "");
  if (!local && !/sslmode=/.test(url)) {
    url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  if (!local && /sslmode=require/.test(url) && !/uselibpqcompat=/.test(url)) {
    url += "&uselibpqcompat=true";
  }
  if (!local) {
    url = url.replace(/@([^/?]+)/, (_match, host: string) => {
      if (!host.includes(".neon.tech") || host.includes("-pooler")) return `@${host}`;
      return `@${host.replace(".", "-pooler.")}`;
    });
  }
  return { url, local };
}

export function getPool() {
  if (!pool) {
    const { url, local } = databaseConfig();
    pool = new Pool({
      connectionString: url,
      max: 1,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
      statement_timeout: 8000,
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
    await applySchema(client);
    await seed(client);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message = error instanceof Error ? error.message : "Erreur PostgreSQL";
    throw new HttpError(500, message);
  } finally {
    client.release();
  }
}

export type Db = Pick<PoolClient, "query">;
