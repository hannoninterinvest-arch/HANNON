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
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE t.relname = 'project_stats' AND c.contype = 'f'
     ) THEN
       ALTER TABLE "project_stats"
         ADD CONSTRAINT "FK_project_stats_project"
         FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
     END IF;
   END $$`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE t.relname = 'investment_requests' AND c.contype = 'f'
         AND pg_get_constraintdef(c.oid) LIKE '%investorId%'
     ) THEN
       ALTER TABLE "investment_requests"
         ADD CONSTRAINT "FK_investment_requests_investor"
         FOREIGN KEY ("investorId") REFERENCES "users"("id") ON DELETE CASCADE;
     END IF;
   END $$`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE t.relname = 'investment_requests' AND c.contype = 'f'
         AND pg_get_constraintdef(c.oid) LIKE '%projectId%'
     ) THEN
       ALTER TABLE "investment_requests"
         ADD CONSTRAINT "FK_investment_requests_project"
         FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
     END IF;
   END $$`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE t.relname = 'service_platforms' AND c.contype = 'f'
     ) THEN
       ALTER TABLE "service_platforms"
         ADD CONSTRAINT "FK_service_platforms_service"
         FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE;
     END IF;
   END $$`,
];

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
