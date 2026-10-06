-- Additive schema for HANNON services, platforms and investor inquiries.
-- Safe to run more than once: it creates missing objects and does not drop or rewrite existing data.
-- The API also creates these tables on startup while TypeORM synchronize remains enabled.
-- Run this file only when synchronize is turned off, or as an explicit migration record:
--   psql "$DATABASE_URL" -f backend/migrations/001_services_and_inquiries.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE "publish_status_enum" AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "inquiry_type_enum" AS ENUM ('proposition', 'question');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "inquiry_status_enum" AS ENUM ('nouveau', 'traité');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "services" (
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
);

CREATE INDEX IF NOT EXISTS "IDX_services_status_sort" ON "services" ("status", "sortOrder");

CREATE TABLE IF NOT EXISTS "service_platforms" (
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
);

CREATE INDEX IF NOT EXISTS "IDX_service_platforms_sort" ON "service_platforms" ("sortOrder");

DO $$ BEGIN
  ALTER TABLE "service_platforms"
    ADD CONSTRAINT "FK_service_platforms_service"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "investor_inquiries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" character varying(254) NOT NULL,
  "type" "inquiry_type_enum" NOT NULL,
  "message" text NOT NULL,
  "receivedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "status" "inquiry_status_enum" NOT NULL DEFAULT 'nouveau',
  "ipHash" character varying(64),
  CONSTRAINT "PK_investor_inquiries" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_inquiries_type_status" ON "investor_inquiries" ("type", "status");
CREATE INDEX IF NOT EXISTS "IDX_inquiries_email_received" ON "investor_inquiries" ("email", "receivedAt");

CREATE TABLE IF NOT EXISTS "inquiry_throttles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ipHash" character varying(64) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_inquiry_throttles" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_inquiry_throttles_ip" ON "inquiry_throttles" ("ipHash", "createdAt");
