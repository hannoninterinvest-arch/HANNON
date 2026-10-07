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
];

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
