import { one, query } from "./db";
import { has, HttpError, isUuid } from "./http";
import { destroyImage, normalizePublicId, readImage, uploadBuffer } from "./media";
import { slugify } from "./slug";
import type { NextRequest } from "next/server";

type Row = Record<string, unknown>;

const PROJECT_COLUMNS = `id, title, slug, description, summary, sector, location, "imageUrl",
  "cloudinaryPublicId", "targetAmount", "raisedAmount", "minInvestment", "expectedReturn",
  "durationMonths", status, visible, highlights, "createdAt", "updatedAt"`;

function highlightsOf(value: unknown) {
  if (value == null || value === "") return value == null ? null : [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function shapeProject(row: Row, stats: Row[]) {
  return {
    ...row,
    highlights: highlightsOf(row.highlights),
    stats: stats.map((stat) => ({
      id: stat.id,
      label: stat.label,
      sortOrder: stat.sortOrder,
      capitalRaised: stat.capitalRaised,
      investorsCount: stat.investorsCount,
      projectedReturn: stat.projectedReturn,
    })),
  };
}

async function withStats(rows: Row[]) {
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const stats = await query(
    `SELECT id, label, "sortOrder", "capitalRaised", "investorsCount", "projectedReturn", "projectId"
     FROM project_stats WHERE "projectId" = ANY($1::uuid[]) ORDER BY "sortOrder" ASC`,
    [ids],
  );
  return rows.map((row) =>
    shapeProject(
      row,
      stats.filter((stat) => stat.projectId === row.id),
    ),
  );
}

export async function listVisibleProjects() {
  const rows = await query(
    `SELECT ${PROJECT_COLUMNS} FROM projects WHERE visible = true ORDER BY "createdAt" DESC`,
  );
  return withStats(rows);
}

export async function listAllProjects() {
  const rows = await query(`SELECT ${PROJECT_COLUMNS} FROM projects ORDER BY "createdAt" DESC`);
  return withStats(rows);
}

export async function getProject(id: string, visibleOnly: boolean) {
  if (!isUuid(id)) throw new HttpError(404, "Project not found");
  const row = await one(
    `SELECT ${PROJECT_COLUMNS} FROM projects WHERE id = $1 ${visibleOnly ? "AND visible = true" : ""}`,
    [id],
  );
  if (!row) throw new HttpError(404, "Project not found");
  const [project] = await withStats([row]);
  return project;
}

function requireText(body: Record<string, unknown>, key: string) {
  const value = String(body[key] ?? "").trim();
  if (!value) throw new HttpError(400, `${key} is required`);
  return value;
}

function requireNumber(body: Record<string, unknown>, key: string, min = 0) {
  const value = Number(body[key]);
  if (!Number.isFinite(value) || value < min) throw new HttpError(400, `${key} is invalid`);
  return value;
}

function optionalStatus(value: unknown, fallback?: string) {
  if (value == null || value === "") return fallback;
  if (value !== "open" && value !== "funded" && value !== "closed") {
    throw new HttpError(400, "status is invalid");
  }
  return value;
}

function highlightsText(value: unknown) {
  if (value == null) return null;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new HttpError(400, "highlights must be a list of strings");
  }
  const items = value.map((item) => item.trim()).filter(Boolean);
  return items.length ? items.join(",") : null;
}

function generateStats(raised: number, expectedReturn: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  return months.map((label, i) => {
    const progress = (i + 1) / months.length;
    return {
      label: `${label} 2026`,
      sortOrder: i,
      capitalRaised: Math.round(raised * progress),
      investorsCount: Math.max(1, Math.round(progress * 18)),
      projectedReturn: Number((expectedReturn * progress).toFixed(2)),
    };
  });
}

function readStats(value: unknown) {
  if (!Array.isArray(value)) throw new HttpError(400, "stats are invalid");
  return value.map((item) => {
    if (!item || typeof item !== "object") throw new HttpError(400, "stats are invalid");
    const row = item as Record<string, unknown>;
    const label = String(row.label || "").trim();
    if (!label || label.length > 64) throw new HttpError(400, "stat label is invalid");
    return {
      label,
      sortOrder: Number(row.sortOrder),
      capitalRaised: Number(row.capitalRaised),
      investorsCount: Math.round(Number(row.investorsCount)),
      projectedReturn: Number(row.projectedReturn),
    };
  });
}

async function insertStats(
  projectId: string,
  stats: ReturnType<typeof generateStats>,
) {
  for (const stat of stats) {
    if (![stat.sortOrder, stat.capitalRaised, stat.investorsCount, stat.projectedReturn].every(Number.isFinite)) {
      throw new HttpError(400, "stats are invalid");
    }
    await query(
      `INSERT INTO project_stats
        (label, "sortOrder", "capitalRaised", "investorsCount", "projectedReturn", "projectId")
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [stat.label, stat.sortOrder, stat.capitalRaised, stat.investorsCount, stat.projectedReturn, projectId],
    );
  }
}

export async function createProject(body: Record<string, unknown>) {
  const title = requireText(body, "title");
  const slug = String(body.slug || "").trim() || slugify(title);
  const existing = await one(`SELECT id FROM projects WHERE slug = $1`, [slug]);
  if (existing) throw new HttpError(400, "A project with this slug already exists");
  const raisedAmount = body.raisedAmount == null ? 0 : requireNumber(body, "raisedAmount");
  const expectedReturn = requireNumber(body, "expectedReturn", Number.NEGATIVE_INFINITY);
  const imageUrl = body.imageUrl == null || body.imageUrl === "" ? null : String(body.imageUrl);
  const cloudinaryPublicId = normalizePublicId(body.cloudinaryPublicId, 255);
  const inserted = await one(
    `INSERT INTO projects
      (title, slug, description, summary, sector, location, "imageUrl", "cloudinaryPublicId",
       "targetAmount", "raisedAmount", "minInvestment", "expectedReturn", "durationMonths",
       status, visible, highlights)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id`,
    [
      title,
      slug,
      requireText(body, "description"),
      body.summary == null || body.summary === "" ? null : String(body.summary),
      requireText(body, "sector"),
      requireText(body, "location"),
      imageUrl,
      cloudinaryPublicId,
      requireNumber(body, "targetAmount"),
      raisedAmount,
      requireNumber(body, "minInvestment"),
      expectedReturn,
      Math.round(requireNumber(body, "durationMonths")),
      optionalStatus(body.status, "open"),
      body.visible === undefined ? true : Boolean(body.visible),
      highlightsText(body.highlights),
    ],
  );
  const stats = Array.isArray(body.stats) && body.stats.length
    ? readStats(body.stats)
    : generateStats(raisedAmount, expectedReturn);
  await insertStats(String(inserted?.id), stats);
  return getProject(String(inserted?.id), false);
}

export async function updateProject(id: string, body: Record<string, unknown>) {
  const current = await getProject(id, false);
  const next = {
    title: has(body, "title") ? requireText(body, "title") : current.title,
    slug: has(body, "slug") ? String(body.slug || "").trim() : current.slug,
    description: has(body, "description") ? requireText(body, "description") : current.description,
    summary: has(body, "summary")
      ? body.summary == null || body.summary === ""
        ? null
        : String(body.summary)
      : current.summary,
    sector: has(body, "sector") ? requireText(body, "sector") : current.sector,
    location: has(body, "location") ? requireText(body, "location") : current.location,
    imageUrl: has(body, "imageUrl")
      ? body.imageUrl == null || body.imageUrl === ""
        ? null
        : String(body.imageUrl)
      : current.imageUrl,
    cloudinaryPublicId: has(body, "cloudinaryPublicId")
      ? normalizePublicId(body.cloudinaryPublicId, 255)
      : current.cloudinaryPublicId,
    targetAmount: has(body, "targetAmount") ? requireNumber(body, "targetAmount") : current.targetAmount,
    raisedAmount: has(body, "raisedAmount") ? requireNumber(body, "raisedAmount") : current.raisedAmount,
    minInvestment: has(body, "minInvestment") ? requireNumber(body, "minInvestment") : current.minInvestment,
    expectedReturn: has(body, "expectedReturn")
      ? requireNumber(body, "expectedReturn", Number.NEGATIVE_INFINITY)
      : current.expectedReturn,
    durationMonths: has(body, "durationMonths")
      ? Math.round(requireNumber(body, "durationMonths"))
      : current.durationMonths,
    status: has(body, "status") ? optionalStatus(body.status) : current.status,
    visible: has(body, "visible") ? Boolean(body.visible) : current.visible,
    highlights: has(body, "highlights") ? highlightsText(body.highlights) : null,
  };
  if (has(body, "slug") && next.slug !== current.slug) {
    const clash = await one(`SELECT id FROM projects WHERE slug = $1 AND id <> $2`, [next.slug, id]);
    if (clash) throw new HttpError(400, "A project with this slug already exists");
  }
  await query(
    `UPDATE projects SET
      title = $2, slug = $3, description = $4, summary = $5, sector = $6, location = $7,
      "imageUrl" = $8, "cloudinaryPublicId" = $9, "targetAmount" = $10, "raisedAmount" = $11,
      "minInvestment" = $12, "expectedReturn" = $13, "durationMonths" = $14, status = $15,
      visible = $16, highlights = CASE WHEN $17 THEN $18 ELSE highlights END, "updatedAt" = now()
     WHERE id = $1`,
    [
      id,
      next.title,
      next.slug,
      next.description,
      next.summary,
      next.sector,
      next.location,
      next.imageUrl,
      next.cloudinaryPublicId,
      next.targetAmount,
      next.raisedAmount,
      next.minInvestment,
      next.expectedReturn,
      next.durationMonths,
      next.status,
      next.visible,
      has(body, "highlights"),
      next.highlights,
    ],
  );
  if (has(body, "stats")) {
    await query(`DELETE FROM project_stats WHERE "projectId" = $1`, [id]);
    await insertStats(id, readStats(body.stats));
  }
  return getProject(id, false);
}

export async function removeProject(id: string) {
  const project = await getProject(id, false);
  await destroyImage(project.cloudinaryPublicId as string | null);
  await query(`DELETE FROM projects WHERE id = $1`, [id]);
  return { deleted: true };
}

export async function uploadProjectImage(req: NextRequest) {
  const buffer = await readImage(req, "project");
  const uploaded = await uploadBuffer(buffer, "hannon/projects");
  return { imageUrl: uploaded.secure_url, cloudinaryPublicId: uploaded.public_id };
}

export async function attachProjectImage(id: string, req: NextRequest) {
  const project = await getProject(id, false);
  const buffer = await readImage(req, "project");
  await destroyImage(project.cloudinaryPublicId as string | null);
  const uploaded = await uploadBuffer(buffer, "hannon/projects");
  await query(
    `UPDATE projects SET "imageUrl" = $2, "cloudinaryPublicId" = $3, "updatedAt" = now() WHERE id = $1`,
    [id, uploaded.secure_url, uploaded.public_id],
  );
  return getProject(id, false);
}
