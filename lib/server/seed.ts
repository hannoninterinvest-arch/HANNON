import bcrypt from "bcryptjs";
import type { PoolClient } from "pg";
import { normalizeName, slugify } from "./slug";


const HANNON_SERVICES = [
  "HANNON Finance",
  "HANNON Tech",
  "HANNON Artisanal",
  "HANNON Prod",
  "HANNON Affichage Urbain — Publicité de rue",
  "HANNON Investissement et Management Transitoire",
  "HANNON Education Tech",
  "HANNON Recherche et Développement",
  "HANNON Healthcare",
  "HANNON Énergie",
  "HANNON Startups",
  "HANNON Commerce International",
  "HANNON IA",
  "HANNON Agriculture",
];

const DEFAULT_PROJECT_SLUGS = [
  "west-africa-solar-corridor",
  "tunis-logistics-gateway",
  "maghreb-green-hydrogen-hub",
  "affordable-housing-tunisia",
];

const DEMO_EMAILS = ["investor@hannoninterinvest.com", "pending@hannoninterinvest.com"];

export async function seed(client: PoolClient) {
  await ensureAdmin(client);
  await removeDemoAccounts(client).catch((error) => console.error(error));
  await removeDefaultProjects(client).catch((error) => console.error(error));
  await ensureHannonServices(client).catch((error) => console.error(error));
}

async function removeDemoAccounts(client: PoolClient) {
  try {
    await client.query(
      `DELETE FROM investment_requests
        WHERE "investorId"::text IN (
          SELECT id::text FROM users WHERE lower(email::text) = ANY($1::text[])
        )`,
      [DEMO_EMAILS],
    );
  } catch {
    // Older databases may not have investment requests yet.
  }
  await client.query(`DELETE FROM users WHERE lower(email::text) = ANY($1::text[])`, [DEMO_EMAILS]);
}

function quoteIdent(name: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Rejected SQL identifier: ${name}`);
  }
  return `"${name}"`;
}

type UserColumn = {
  name: string;
  notNull: boolean;
  hasDefault: boolean;
  udtName: string;
  typtype: string;
  identity: string;
  generated: string;
};

async function describeUsers(client: PoolClient): Promise<UserColumn[]> {
  const result = await client.query<UserColumn>(
    `SELECT a.attname AS name,
            a.attnotnull AS "notNull",
            a.atthasdef AS "hasDefault",
            t.typname AS "udtName",
            t.typtype AS typtype,
            a.attidentity AS identity,
            a.attgenerated AS generated
     FROM pg_attribute a
     JOIN pg_type t ON t.oid = a.atttypid
     WHERE a.attrelid = 'users'::regclass
       AND a.attnum > 0
       AND NOT a.attisdropped
     ORDER BY a.attnum`,
  );
  return result.rows;
}

function columnNames(columns: UserColumn[]) {
  return new Set(columns.map((column) => column.name));
}

async function ensureAdmin(client: PoolClient) {
  const email = (process.env.ADMIN_EMAIL || "admin@hannoninterinvest.com").toLowerCase();
  const columns = columnNames(await describeUsers(client));
  const existing = await client.query(
    `SELECT id::text AS id,
            ${columns.has("password") ? "password" : "NULL::text AS password"},
            ${columns.has("role") ? "role::text" : "NULL::text"} AS role,
            ${columns.has("status") ? "status::text" : "NULL::text"} AS status
     FROM users WHERE lower(email::text) = $1`,
    [email],
  );
  if (existing.rowCount) {
    const row = existing.rows[0] as { id: string; password: string | null; role: string | null; status: string | null };
    if (row.password && row.role && row.status) return;
    const password = row.password || (await bcrypt.hash(process.env.ADMIN_PASSWORD || "HannonAdmin2026!", 12));
    const assignments: string[] = [];
    const params: unknown[] = [row.id];
    if (columns.has("password")) {
      params.push(password);
      assignments.push(`password = COALESCE(NULLIF(password, ''), $${params.length}::text)`);
    }
    if (columns.has("role")) assignments.push(`role = COALESCE(role, 'admin')`);
    if (columns.has("status")) assignments.push(`status = COALESCE(status, 'approved')`);
    if (columns.has("updatedAt")) assignments.push(`"updatedAt" = now()`);
    if (!assignments.length) return;
    await client.query(
      `UPDATE users SET ${assignments.join(", ")} WHERE id::text = $1`,
      params,
    );
    return;
  }
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "HannonAdmin2026!", 12);
  await insertAdmin(client, email, password);
}

async function insertAdmin(client: PoolClient, email: string, password: string) {
  const columns = await describeUsers(client);
  const known: Record<string, unknown> = {
    email,
    password,
    firstName: "HANNON",
    lastName: "Administrator",
    first_name: "HANNON",
    last_name: "Administrator",
    company: "HANNON International Investments Ltd",
    role: "admin",
    status: "approved",
    name: "HANNON Administrator",
    fullName: "HANNON Administrator",
    displayName: "HANNON Administrator",
    full_name: "HANNON Administrator",
    display_name: "HANNON Administrator",
    username: "hannon-admin",
    userName: "hannon-admin",
  };
  const insertNames: string[] = [];
  const placeholders: string[] = [];
  const params: unknown[] = [];
  for (const column of columns) {
    if (column.identity || column.generated) continue;
    let value: unknown;
    if (Object.prototype.hasOwnProperty.call(known, column.name)) {
      value = known[column.name];
    } else if (column.hasDefault || !column.notNull) {
      continue;
    } else if (column.name === "id") {
      continue;
    } else if (["bool"].includes(column.udtName)) {
      value = false;
    } else if (["int2", "int4", "int8", "numeric", "float4", "float8"].includes(column.udtName)) {
      value = 0;
    } else if (["timestamp", "timestamptz", "date"].includes(column.udtName)) {
      value = new Date();
    } else if (["json", "jsonb"].includes(column.udtName)) {
      value = {};
    } else if (column.udtName === "uuid") {
      continue;
    } else {
      value = "";
    }
    params.push(value);
    insertNames.push(quoteIdent(column.name));
    placeholders.push(`$${params.length}`);
  }
  if (!insertNames.length) return;
  params.push(email);
  await client.query(
    `INSERT INTO users (${insertNames.join(", ")})
     SELECT ${placeholders.join(", ")}
     WHERE NOT EXISTS (
       SELECT 1 FROM users WHERE lower(email::text) = lower($${params.length}::text)
     )`,
    params,
  );
}

async function removeDefaultProjects(client: PoolClient) {
  const name = "remove-default-projects-v1";
  await client.query(
    `CREATE TABLE IF NOT EXISTS app_migrations (
       name text PRIMARY KEY,
       "ranAt" timestamp NOT NULL DEFAULT now()
     )`,
  );
  const done = await client.query(`SELECT 1 FROM app_migrations WHERE name = $1`, [name]);
  if (done.rowCount) return;

  try {
    await client.query("BEGIN");
    const found = await client.query(`SELECT id::text AS id FROM projects WHERE slug = ANY($1::text[])`, [
      DEFAULT_PROJECT_SLUGS,
    ]);
    const ids = found.rows.map((row) => String(row.id));
    if (ids.length) {
      await client.query(`DELETE FROM project_stats WHERE "projectId"::text = ANY($1::text[])`, [ids]);
      await client.query(`DELETE FROM investment_requests WHERE "projectId"::text = ANY($1::text[])`, [ids]);
      await client.query(
        `UPDATE investor_inquiries SET "projectId" = NULL WHERE "projectId"::text = ANY($1::text[])`,
        [ids],
      );
      await client.query(`DELETE FROM projects WHERE id::text = ANY($1::text[])`, [ids]);
    }
    await client.query(`INSERT INTO app_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

async function ensureHannonServices(client: PoolClient) {
  const existing = await client.query(`SELECT name, slug, "sortOrder" FROM services`);
  const knownNames = new Set(existing.rows.map((row) => normalizeName(String(row.name))));
  const knownSlugs = new Set(existing.rows.map((row) => String(row.slug)));
  let order =
    existing.rows.reduce((max, row) => Math.max(max, Number(row.sortOrder)), -1) + 1;

  for (const name of HANNON_SERVICES) {
    const slug = slugify(name);
    if (knownNames.has(normalizeName(name)) || knownSlugs.has(slug)) continue;
    await client.query(
      `INSERT INTO services (name, slug, description, "sortOrder", status, "placeholdersPrepared")
       VALUES ($1, $2, '', $3, 'draft', false)
       ON CONFLICT (slug) DO NOTHING`,
      [name, slug, order],
    );
    knownNames.add(normalizeName(name));
    knownSlugs.add(slug);
    order += 1;
  }
  await ensureFinancePlaceholders(client);
}

async function ensureFinancePlaceholders(client: PoolClient) {
  const services = await client.query(
    `SELECT id, name, "placeholdersPrepared" FROM services`,
  );
  const finance = services.rows.find(
    (row) => normalizeName(String(row.name)) === normalizeName("HANNON Finance"),
  );
  if (!finance || finance.placeholdersPrepared) return;

  const platforms = await client.query(
    `SELECT id FROM service_platforms WHERE "serviceId" = $1`,
    [finance.id],
  );
  if (!platforms.rowCount) {
    for (let index = 0; index < 3; index += 1) {
      await client.query(
        `INSERT INTO service_platforms
          ("serviceId", name, description, link, "imageUrl", "imagePublicId",
           "secondImageUrl", "secondImagePublicId", "sortOrder", status)
         VALUES ($1, '', '', NULL, NULL, NULL, NULL, NULL, $2, 'draft')`,
        [finance.id, index],
      );
    }
  }
  await client.query(`UPDATE services SET "placeholdersPrepared" = true WHERE id = $1`, [
    finance.id,
  ]);
}
