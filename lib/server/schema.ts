import type { PoolClient } from "pg";

const STATEMENTS = [
  `DO $$ BEGIN
     CREATE TYPE "users_role_enum" AS ENUM ('admin', 'investor');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `DO $$ BEGIN
     CREATE TYPE "users_status_enum" AS ENUM ('pending', 'approved', 'rejected');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `DO $$ BEGIN
     CREATE TYPE "projects_status_enum" AS ENUM ('open', 'funded', 'closed');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `DO $$ BEGIN
     CREATE TYPE "investment_requests_status_enum" AS ENUM ('pending', 'accepted', 'rejected');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `DO $$ BEGIN
     CREATE TYPE "publish_status_enum" AS ENUM ('draft', 'published');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `DO $$ BEGIN
     CREATE TYPE "inquiry_type_enum" AS ENUM ('proposition', 'question');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `DO $$ BEGIN
     CREATE TYPE "inquiry_status_enum" AS ENUM ('nouveau', 'traité');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `CREATE TABLE IF NOT EXISTS "users" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "email" character varying(255) NOT NULL,
     "password" character varying(255) NOT NULL,
     "firstName" character varying(120) NOT NULL,
     "lastName" character varying(120) NOT NULL,
     "company" character varying(255),
     "phone" character varying(64),
     "role" "users_role_enum" NOT NULL DEFAULT 'investor',
     "status" "users_status_enum" NOT NULL DEFAULT 'pending',
     "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
     "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
     CONSTRAINT "PK_users" PRIMARY KEY ("id"),
     CONSTRAINT "UQ_users_email" UNIQUE ("email")
   )`,
  // CREATE TABLE IF NOT EXISTS does nothing when users already exists.
  // Older databases can lack password (or store it under another name).
  // Add the missing columns, or rename a known hash column, without
  // rewriting existing values.
  `DO $$
BEGIN
  IF to_regclass('users') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'password' AND attnum > 0 AND NOT attisdropped
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'passwordHash' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password";
    ELSIF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'password_hash' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password";
    ELSIF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'hashedPassword' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "hashedPassword" TO "password";
    ELSE
      ALTER TABLE "users" ADD COLUMN "password" character varying(255);
    END IF;
  ELSIF EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'passwordHash' AND attnum > 0 AND NOT attisdropped
  ) THEN
    BEGIN
      UPDATE "users"
         SET "password" = "passwordHash"
       WHERE "password" IS NULL
         AND "passwordHash" IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'email' AND attnum > 0 AND NOT attisdropped
  ) THEN
    ALTER TABLE "users" ADD COLUMN "email" character varying(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'firstName' AND attnum > 0 AND NOT attisdropped
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'first_name' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName";
    ELSE
      ALTER TABLE "users" ADD COLUMN "firstName" character varying(120) DEFAULT '';
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'lastName' AND attnum > 0 AND NOT attisdropped
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'last_name' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName";
    ELSE
      ALTER TABLE "users" ADD COLUMN "lastName" character varying(120) DEFAULT '';
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'company' AND attnum > 0 AND NOT attisdropped
  ) THEN
    ALTER TABLE "users" ADD COLUMN "company" character varying(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'phone' AND attnum > 0 AND NOT attisdropped
  ) THEN
    ALTER TABLE "users" ADD COLUMN "phone" character varying(64);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'role' AND attnum > 0 AND NOT attisdropped
  ) THEN
    ALTER TABLE "users" ADD COLUMN "role" "users_role_enum";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'status' AND attnum > 0 AND NOT attisdropped
  ) THEN
    ALTER TABLE "users" ADD COLUMN "status" "users_status_enum";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'createdAt' AND attnum > 0 AND NOT attisdropped
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'created_at' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";
    ELSE
      ALTER TABLE "users" ADD COLUMN "createdAt" TIMESTAMP DEFAULT now();
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'users'::regclass AND attname = 'updatedAt' AND attnum > 0 AND NOT attisdropped
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'users'::regclass AND attname = 'updated_at' AND attnum > 0 AND NOT attisdropped
    ) THEN
      ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";
    ELSE
      ALTER TABLE "users" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT now();
    END IF;
  END IF;

END $$`,
  ensureIdDefault("users"),
  `CREATE TABLE IF NOT EXISTS "projects" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "title" character varying(255) NOT NULL,
     "slug" character varying(255) NOT NULL,
     "description" text NOT NULL,
     "summary" text,
     "sector" character varying(120) NOT NULL,
     "location" character varying(255) NOT NULL,
     "imageUrl" text,
     "cloudinaryPublicId" character varying(255),
     "targetAmount" numeric(14,2) NOT NULL DEFAULT 0,
     "raisedAmount" numeric(14,2) NOT NULL DEFAULT 0,
     "minInvestment" numeric(14,2) NOT NULL DEFAULT 0,
     "expectedReturn" numeric(5,2) NOT NULL DEFAULT 0,
     "durationMonths" integer NOT NULL DEFAULT 12,
     "status" "projects_status_enum" NOT NULL DEFAULT 'open',
     "visible" boolean NOT NULL DEFAULT true,
     "highlights" text,
     "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
     "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
     CONSTRAINT "PK_projects" PRIMARY KEY ("id"),
     CONSTRAINT "UQ_projects_slug" UNIQUE ("slug")
   )`,
  `CREATE TABLE IF NOT EXISTS "project_stats" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "label" character varying(64) NOT NULL,
     "sortOrder" integer NOT NULL DEFAULT 0,
     "capitalRaised" numeric(14,2) NOT NULL DEFAULT 0,
     "investorsCount" integer NOT NULL DEFAULT 0,
     "projectedReturn" numeric(6,2) NOT NULL DEFAULT 0,
     "projectId" uuid,
     CONSTRAINT "PK_project_stats" PRIMARY KEY ("id")
   )`,
  `CREATE TABLE IF NOT EXISTS "investment_requests" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "amount" numeric(14,2) NOT NULL,
     "message" text,
     "status" "investment_requests_status_enum" NOT NULL DEFAULT 'pending',
     "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
     "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
     "investorId" uuid,
     "projectId" uuid,
     CONSTRAINT "PK_investment_requests" PRIMARY KEY ("id")
   )`,
  `CREATE TABLE IF NOT EXISTS "services" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "name" character varying(180) NOT NULL,
     "slug" character varying(200) NOT NULL,
     "description" text NOT NULL DEFAULT '',
     "imageUrl" text,
     "cloudinaryPublicId" character varying(512),
     "sortOrder" integer NOT NULL DEFAULT 0,
     "status" "publish_status_enum" NOT NULL DEFAULT 'draft',
     "placeholdersPrepared" boolean NOT NULL DEFAULT false,
     "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
     "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
     CONSTRAINT "PK_services" PRIMARY KEY ("id"),
     CONSTRAINT "UQ_services_slug" UNIQUE ("slug")
   )`,
  `CREATE TABLE IF NOT EXISTS "service_platforms" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "serviceId" uuid,
     "name" character varying(180) NOT NULL DEFAULT '',
     "description" text NOT NULL DEFAULT '',
     "link" character varying(500),
     "imageUrl" text,
     "imagePublicId" character varying(512),
     "secondImageUrl" text,
     "secondImagePublicId" character varying(512),
     "sortOrder" integer NOT NULL DEFAULT 0,
     "status" "publish_status_enum" NOT NULL DEFAULT 'draft',
     "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
     "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
     CONSTRAINT "PK_service_platforms" PRIMARY KEY ("id")
   )`,
  `CREATE TABLE IF NOT EXISTS "investor_inquiries" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "email" character varying(254) NOT NULL,
     "type" "inquiry_type_enum" NOT NULL,
     "message" text NOT NULL,
     "receivedAt" TIMESTAMP NOT NULL DEFAULT now(),
     "status" "inquiry_status_enum" NOT NULL DEFAULT 'nouveau',
     "ipHash" character varying(64),
     CONSTRAINT "PK_investor_inquiries" PRIMARY KEY ("id")
   )`,
  `CREATE TABLE IF NOT EXISTS "inquiry_throttles" (
     "id" uuid NOT NULL DEFAULT gen_random_uuid(),
     "ipHash" character varying(64) NOT NULL,
     "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
     CONSTRAINT "PK_inquiry_throttles" PRIMARY KEY ("id")
   )`,
  `CREATE INDEX IF NOT EXISTS "IDX_services_status_sort" ON "services" ("status", "sortOrder")`,
  `CREATE INDEX IF NOT EXISTS "IDX_service_platforms_sort" ON "service_platforms" ("sortOrder")`,
  `CREATE INDEX IF NOT EXISTS "IDX_inquiries_type_status" ON "investor_inquiries" ("type", "status")`,
  `CREATE INDEX IF NOT EXISTS "IDX_inquiries_email_received" ON "investor_inquiries" ("email", "receivedAt")`,
  `CREATE INDEX IF NOT EXISTS "IDX_inquiry_throttles_ip" ON "inquiry_throttles" ("ipHash", "createdAt")`,
  ensureForeignKey("project_stats", "projectId", "projects", "id", "FK_project_stats_project"),
  ensureForeignKey(
    "investment_requests",
    "investorId",
    "users",
    "id",
    "FK_investment_requests_investor",
  ),
  ensureForeignKey(
    "investment_requests",
    "projectId",
    "projects",
    "id",
    "FK_investment_requests_project",
  ),
  ensureForeignKey(
    "service_platforms",
    "serviceId",
    "services",
    "id",
    "FK_service_platforms_service",
  ),
  ensureIdDefault("projects"),
  ensureIdDefault("project_stats"),
  ensureIdDefault("investment_requests"),
  ensureIdDefault("services"),
  ensureIdDefault("service_platforms"),
  ensureIdDefault("investor_inquiries"),
  ensureIdDefault("inquiry_throttles"),
];

function ensureIdDefault(table: string) {
  const name = sqlIdent(table);
  return `DO $$
DECLARE
  id_type oid;
  id_typmod integer;
  id_len integer;
  has_default boolean;
  default_expr text;
  max_id bigint;
  seq_name text := '${name}_id_seq';
BEGIN
  IF to_regclass('${name}') IS NULL THEN
    RETURN;
  END IF;

  SELECT a.atttypid, a.atttypmod, a.atthasdef, pg_get_expr(d.adbin, d.adrelid)
    INTO id_type, id_typmod, has_default, default_expr
  FROM pg_attribute a
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attrelid = '${name}'::regclass
    AND a.attname = 'id'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF id_type IS NULL THEN
    RETURN;
  END IF;
  IF has_default AND default_expr IS NOT NULL AND btrim(default_expr) <> 'NULL' THEN
    RETURN;
  END IF;

  IF id_type = 'uuid'::regtype THEN
    EXECUTE format('ALTER TABLE %s ALTER COLUMN id SET DEFAULT gen_random_uuid()', '${name}'::regclass);
  ELSIF id_type IN ('text'::regtype, 'varchar'::regtype, 'bpchar'::regtype) THEN
    id_len := CASE WHEN id_typmod > 0 THEN id_typmod - 4 ELSE NULL END;
    IF id_len IS NOT NULL AND id_len < 36 THEN
      EXECUTE format(
        'ALTER TABLE %s ALTER COLUMN id SET DEFAULT left(replace(gen_random_uuid()::text, %L, %L), %s)',
        '${name}'::regclass, '-', '', GREATEST(id_len, 1)
      );
    ELSE
      EXECUTE format('ALTER TABLE %s ALTER COLUMN id SET DEFAULT gen_random_uuid()::text', '${name}'::regclass);
    END IF;
  ELSIF id_type IN ('int2'::regtype, 'int4'::regtype, 'int8'::regtype) THEN
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', seq_name);
    EXECUTE format('SELECT MAX(id)::bigint FROM %s', '${name}'::regclass) INTO max_id;
    PERFORM setval(seq_name, COALESCE(max_id, 1), max_id IS NOT NULL);
    EXECUTE format('ALTER TABLE %s ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', '${name}'::regclass, seq_name);
    BEGIN
      EXECUTE format('ALTER SEQUENCE %I OWNED BY %s.id', seq_name, '${name}'::regclass);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$`;
}

function sqlIdent(value: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Identifiant SQL refusé: ${value}`);
  }
  return value;
}

// Existing databases may store the foreign-key column as text while the
// referenced id is uuid (or the reverse). Postgres then rejects the
// constraint with "cannot be implemented". Align only a lossless text/uuid
// pair, and leave every other mismatch untouched so startup can continue.
function ensureForeignKey(
  table: string,
  column: string,
  refTable: string,
  refColumn: string,
  constraint: string,
) {
  const childTable = sqlIdent(table);
  const childColumn = sqlIdent(column);
  const parentTable = sqlIdent(refTable);
  const parentColumn = sqlIdent(refColumn);
  const constraintName = sqlIdent(constraint);
  return `DO $$
DECLARE
  child_typid oid;
  parent_typid oid;
  parent_typmod integer;
  parent_sql text;
  invalid_count bigint;
  uuid_type oid := 'uuid'::regtype;
  text_type oid := 'text'::regtype;
  varchar_type oid := 'varchar'::regtype;
  bpchar_type oid := 'bpchar'::regtype;
BEGIN
  IF to_regclass('${childTable}') IS NULL OR to_regclass('${parentTable}') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.oid = '${childTable}'::regclass
      AND c.contype = 'f'
      AND pg_get_constraintdef(c.oid) ILIKE '%${childColumn}%'
  ) THEN
    RETURN;
  END IF;

  SELECT a.atttypid, a.atttypmod, format_type(a.atttypid, a.atttypmod)
    INTO parent_typid, parent_typmod, parent_sql
  FROM pg_attribute a
  WHERE a.attrelid = '${parentTable}'::regclass
    AND a.attname = '${parentColumn}'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  SELECT a.atttypid
    INTO child_typid
  FROM pg_attribute a
  WHERE a.attrelid = '${childTable}'::regclass
    AND a.attname = '${childColumn}'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF child_typid IS NULL OR parent_typid IS NULL THEN
    RETURN;
  END IF;

  IF child_typid <> parent_typid THEN
    IF child_typid IN (text_type, varchar_type, bpchar_type) AND parent_typid = uuid_type THEN
      EXECUTE format(
        'SELECT count(*) FROM %s WHERE %I IS NOT NULL AND btrim(%I::text) !~ %L',
        '${childTable}'::regclass,
        '${childColumn}',
        '${childColumn}',
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      ) INTO invalid_count;
      IF invalid_count > 0 THEN
        RETURN;
      END IF;
      BEGIN
        EXECUTE format(
          'ALTER TABLE %s ALTER COLUMN %I TYPE uuid USING btrim(%I::text)::uuid',
          '${childTable}'::regclass,
          '${childColumn}',
          '${childColumn}'
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN;
      END;
    ELSIF child_typid = uuid_type AND parent_typid IN (text_type, varchar_type, bpchar_type) THEN
      IF parent_typid IN (varchar_type, bpchar_type)
         AND parent_typmod > 0
         AND (parent_typmod - 4) < 36 THEN
        RETURN;
      END IF;
      BEGIN
        EXECUTE format(
          'ALTER TABLE %s ALTER COLUMN %I TYPE %s USING %I::text',
          '${childTable}'::regclass,
          '${childColumn}',
          parent_sql,
          '${childColumn}'
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN;
      END;
    ELSE
      RETURN;
    END IF;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s (%I) ON DELETE CASCADE',
      '${childTable}'::regclass,
      '${constraintName}',
      '${childColumn}',
      '${parentTable}'::regclass,
      '${parentColumn}'
    );
  EXCEPTION
    WHEN datatype_mismatch OR duplicate_object OR foreign_key_violation THEN
      NULL;
  END;
END $$`;
}

export async function applySchema(client: PoolClient) {
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  } catch {
    // Postgres 13+ and Neon already provide gen_random_uuid().
  }
  for (const statement of STATEMENTS) {
    try {
      await client.query(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur SQL";
      throw new Error(message);
    }
  }
}
