import type { NextRequest } from "next/server";
import { one, query } from "./db";
import { has, HttpError, isUuid } from "./http";
import {
  destroyImage,
  normalizeImageUrl,
  normalizeLink,
  normalizePublicId,
  readImage,
  uploadBuffer,
} from "./media";
import { slugify } from "./slug";

type Row = Record<string, any>;

function publishStatus(value: unknown, fallback = "draft") {
  if (value == null || value === "") return fallback;
  if (value !== "draft" && value !== "published") throw new HttpError(400, "Statut invalide.");
  return value;
}

function sortOrder(value: unknown) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 10000) {
    throw new HttpError(400, "L'ordre d'affichage est invalide.");
  }
  return number;
}

function assertPublishable(status: string, name: string, subject = "ce service") {
  if (status === "published" && !name.trim()) {
    throw new HttpError(400, `Indiquez un nom avant de publier ${subject}.`);
  }
}

function publicPlatform(row: Row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    link: row.link,
    imageUrl: row.imageUrl,
    secondImageUrl: row.secondImageUrl,
    sortOrder: row.sortOrder,
  };
}

function adminPlatform(row: Row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    link: row.link,
    imageUrl: row.imageUrl,
    imagePublicId: row.imagePublicId,
    secondImageUrl: row.secondImageUrl,
    secondImagePublicId: row.secondImagePublicId,
    sortOrder: row.sortOrder,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function platformsOf(serviceId: string) {
  return query(
    `SELECT * FROM service_platforms WHERE "serviceId" = $1 ORDER BY "sortOrder" ASC, name ASC`,
    [serviceId],
  );
}

export async function listPublishedServices() {
  const rows = await query(
    `SELECT id, name, slug, description, "imageUrl", "sortOrder"
     FROM services WHERE status = 'published'
     ORDER BY "sortOrder" ASC, name ASC`,
  );
  return rows;
}

export async function publishedBySlug(slug: string) {
  const service = await one(`SELECT * FROM services WHERE slug = $1 AND status = 'published'`, [slug]);
  if (!service) throw new HttpError(404, "Service introuvable");
  const platforms = (await platformsOf(String(service.id)))
    .filter((platform) => platform.status === "published")
    .map(publicPlatform);
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    imageUrl: service.imageUrl,
    sortOrder: service.sortOrder,
    platforms,
  };
}

export async function listAdminServices() {
  const services = await query(`SELECT * FROM services ORDER BY "sortOrder" ASC, name ASC`);
  const platforms = await query(
    `SELECT * FROM service_platforms ORDER BY "sortOrder" ASC, name ASC`,
  );
  return services.map((service) => ({
    ...service,
    platforms: platforms.filter((platform) => platform.serviceId === service.id).map(adminPlatform),
  }));
}

export async function getAdminService(id: string) {
  if (!isUuid(id)) throw new HttpError(404, "Service introuvable");
  const service = await one(`SELECT * FROM services WHERE id = $1`, [id]);
  if (!service) throw new HttpError(404, "Service introuvable");
  return {
    ...service,
    platforms: (await platformsOf(id)).map(adminPlatform),
  };
}

async function nextSortOrder() {
  const row = await one(`SELECT COALESCE(MAX("sortOrder"), -1)::int AS max FROM services`);
  return Number(row?.max ?? -1) + 1;
}

async function uniqueSlug(base: string) {
  let slug = base;
  let i = 2;
  while (await one(`SELECT id FROM services WHERE slug = $1`, [slug])) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function createService(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  if (!name || name.length > 180) throw new HttpError(400, "Le nom du service est obligatoire.");
  const description = String(body.description ?? "").trim();
  if (description.length > 8000) throw new HttpError(400, "La description est trop longue.");
  const status = publishStatus(body.status);
  assertPublishable(status, name);
  const order = has(body, "sortOrder") ? sortOrder(body.sortOrder) : await nextSortOrder();
  const inserted = await one(
    `INSERT INTO services
      (name, slug, description, "imageUrl", "cloudinaryPublicId", "sortOrder", status, "placeholdersPrepared")
     VALUES ($1,$2,$3,$4,$5,$6,$7,false)
     RETURNING id`,
    [
      name,
      await uniqueSlug(slugify(name)),
      description,
      normalizeImageUrl(body.imageUrl),
      normalizePublicId(body.cloudinaryPublicId),
      order,
      status,
    ],
  );
  return getAdminService(String(inserted?.id));
}

export async function updateService(id: string, body: Record<string, unknown>) {
  const service = await getAdminService(id);
  const name = has(body, "name") ? String(body.name ?? "").trim() : service.name;
  if (!name || name.length > 180) throw new HttpError(400, "Le nom du service est obligatoire.");
  const description = has(body, "description") ? String(body.description ?? "").trim() : service.description;
  if (description.length > 8000) throw new HttpError(400, "La description est trop longue.");
  const status = has(body, "status") ? publishStatus(body.status) : service.status;
  const order = has(body, "sortOrder") ? sortOrder(body.sortOrder) : service.sortOrder;
  assertPublishable(status, name);
  let imageUrl = service.imageUrl;
  let publicId = service.cloudinaryPublicId;
  if (has(body, "imageUrl") || has(body, "cloudinaryPublicId")) {
    const nextUrl = has(body, "imageUrl") ? normalizeImageUrl(body.imageUrl) : imageUrl;
    const nextId = has(body, "cloudinaryPublicId") ? normalizePublicId(body.cloudinaryPublicId) : publicId;
    if (publicId && publicId !== nextId) await destroyImage(publicId);
    imageUrl = nextUrl;
    publicId = nextId;
  }
  await query(
    `UPDATE services SET name = $2, description = $3, "imageUrl" = $4, "cloudinaryPublicId" = $5,
      "sortOrder" = $6, status = $7, "updatedAt" = now()
     WHERE id = $1`,
    [id, name, description, imageUrl, publicId, order, status],
  );
  return getAdminService(id);
}

export async function removeService(id: string) {
  const service = await getAdminService(id);
  await destroyImage(service.cloudinaryPublicId);
  for (const platform of service.platforms || []) {
    await destroyImage(platform.imagePublicId);
    await destroyImage(platform.secondImagePublicId);
  }
  await query(`DELETE FROM services WHERE id = $1`, [id]);
  return { deleted: true };
}

export async function uploadServiceImage(req: NextRequest) {
  const buffer = await readImage(req, "service");
  const uploaded = await uploadBuffer(buffer, "hannon/services");
  return { imageUrl: uploaded.secure_url, cloudinaryPublicId: uploaded.public_id };
}

async function findPlatform(serviceId: string, platformId: string) {
  if (!isUuid(serviceId) || !isUuid(platformId)) throw new HttpError(404, "Plateforme introuvable");
  const platform = await one(
    `SELECT * FROM service_platforms WHERE id = $1 AND "serviceId" = $2`,
    [platformId, serviceId],
  );
  if (!platform) throw new HttpError(404, "Plateforme introuvable");
  return platform;
}

export async function addPlatform(serviceId: string, body: Record<string, unknown>) {
  const service = await getAdminService(serviceId);
  const name = String(body.name ?? "").trim();
  if (name.length > 180) throw new HttpError(400, "Le nom de la plateforme est trop long.");
  const description = String(body.description ?? "").trim();
  if (description.length > 8000) throw new HttpError(400, "La description est trop longue.");
  const status = publishStatus(body.status);
  assertPublishable(status, name, "cette plateforme");
  const order = has(body, "sortOrder")
    ? sortOrder(body.sortOrder)
    : (service.platforms || []).reduce((max: number, item: Row) => Math.max(max, Number(item.sortOrder)), -1) + 1;
  const inserted = await one(
    `INSERT INTO service_platforms
      ("serviceId", name, description, link, "imageUrl", "imagePublicId",
       "secondImageUrl", "secondImagePublicId", "sortOrder", status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      serviceId,
      name,
      description,
      normalizeLink(body.link),
      normalizeImageUrl(body.imageUrl),
      normalizePublicId(body.imagePublicId),
      normalizeImageUrl(body.secondImageUrl),
      normalizePublicId(body.secondImagePublicId),
      order,
      status,
    ],
  );
  return adminPlatform(inserted as Row);
}

async function assignImage(
  currentUrl: string | null,
  currentId: string | null,
  body: Record<string, unknown>,
  urlKey: string,
  idKey: string,
) {
  if (!has(body, urlKey) && !has(body, idKey)) return { url: currentUrl, id: currentId };
  const url = has(body, urlKey) ? normalizeImageUrl(body[urlKey]) : currentUrl;
  const id = has(body, idKey) ? normalizePublicId(body[idKey]) : currentId;
  if (currentId && currentId !== id) await destroyImage(currentId);
  return { url, id };
}

export async function updatePlatform(serviceId: string, platformId: string, body: Record<string, unknown>) {
  const platform = await findPlatform(serviceId, platformId);
  const name = has(body, "name") ? String(body.name ?? "").trim() : platform.name;
  if (name.length > 180) throw new HttpError(400, "Le nom de la plateforme est trop long.");
  const description = has(body, "description") ? String(body.description ?? "").trim() : platform.description;
  if (description.length > 8000) throw new HttpError(400, "La description est trop longue.");
  const status = has(body, "status") ? publishStatus(body.status) : platform.status;
  const order = has(body, "sortOrder") ? sortOrder(body.sortOrder) : platform.sortOrder;
  assertPublishable(status, name, "cette plateforme");
  const link = has(body, "link") ? normalizeLink(body.link) : platform.link;
  const first = await assignImage(platform.imageUrl, platform.imagePublicId, body, "imageUrl", "imagePublicId");
  const second = await assignImage(
    platform.secondImageUrl,
    platform.secondImagePublicId,
    body,
    "secondImageUrl",
    "secondImagePublicId",
  );
  const updated = await one(
    `UPDATE service_platforms SET
      name = $3, description = $4, link = $5, "imageUrl" = $6, "imagePublicId" = $7,
      "secondImageUrl" = $8, "secondImagePublicId" = $9, "sortOrder" = $10, status = $11, "updatedAt" = now()
     WHERE id = $1 AND "serviceId" = $2
     RETURNING *`,
    [platformId, serviceId, name, description, link, first.url, first.id, second.url, second.id, order, status],
  );
  return adminPlatform(updated as Row);
}

export async function removePlatform(serviceId: string, platformId: string) {
  const platform = await findPlatform(serviceId, platformId);
  await destroyImage(platform.imagePublicId);
  await destroyImage(platform.secondImagePublicId);
  await query(`DELETE FROM service_platforms WHERE id = $1`, [platformId]);
  return { deleted: true };
}
