import { one, query } from "./db";
import { HttpError, isUuid } from "./http";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const IP_LIMIT_PER_HOUR = 8;
const EMAIL_LIMIT_PER_DAY = 5;
const MIN_GAP_MS = 20 * 1000;
const DEDUPE_MS = 2 * 60 * 1000;
const MIN_FILL_MS = 400;

const PUBLIC_COLUMNS = `id, email, type, message, "receivedAt", status, name, phone, "projectId", "projectTitle"`;

export async function createInquiry(body: Record<string, unknown>, ipHash: string) {
  await throttle(ipHash);
  const website = body.website;
  if (website != null && typeof website !== "string") {
    throw new HttpError(400, "Requête invalide.");
  }
  if (typeof website === "string" && website.length > 200) {
    throw new HttpError(400, "Requête invalide.");
  }
  if (typeof website === "string" && website.trim()) return { ok: true as const };

  if (body.startedAt != null && body.startedAt !== "") {
    const startedAt = Number(body.startedAt);
    if (!Number.isFinite(startedAt)) throw new HttpError(400, "Requête invalide.");
    const elapsed = Date.now() - startedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
      throw new HttpError(400, "Veuillez patienter un instant avant d'envoyer le formulaire.");
    }
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new HttpError(400, "Indiquez une adresse e-mail valide.");
  }
  const type = body.type;
  if (type !== "proposition" && type !== "question") {
    throw new HttpError(400, "Choisissez Proposition ou Question.");
  }
  const projectId = body.projectId == null ? null : String(body.projectId);
  let projectTitle: string | null = null;
  let name: string | null = null;
  let phone: string | null = null;
  if (projectId !== null) {
    if (!isUuid(projectId)) throw new HttpError(400, "Projet invalide.");
    const project = await one(`SELECT title FROM projects WHERE id = $1 AND visible = true`, [projectId]);
    if (!project) throw new HttpError(404, "Projet introuvable.");
    projectTitle = String(project.title);
    name = String(body.name ?? "").trim();
    phone = String(body.phone ?? "").trim();
    if (!name || name.length > 180) throw new HttpError(400, "Indiquez votre nom.");
    if (phone.length > 64 || !/^[+0-9() .-]{6,64}$/.test(phone) || phone.replace(/\D/g, "").length < 6) throw new HttpError(400, "Indiquez un numéro de téléphone valide.");
  }
  const message = String(body.message ?? "").trim();
  if (projectId === null && message.length < 5) throw new HttpError(400, "Le message doit contenir au moins 5 caractères.");
  if (message.length > 5000) throw new HttpError(400, "Le message ne peut pas dépasser 5000 caractères.");

  const duplicate = await one(
    `SELECT id FROM investor_inquiries
     WHERE email = $1 AND type = $2 AND message = $3 AND "receivedAt" > $4 AND "projectId" IS NOT DISTINCT FROM $5::uuid`,
    [email, type, message, new Date(Date.now() - DEDUPE_MS), projectId],
  );
  if (duplicate) return { ok: true as const };

  const recent = await one(
    `SELECT COUNT(*)::int AS count FROM investor_inquiries WHERE email = $1 AND "receivedAt" > $2`,
    [email, new Date(Date.now() - MIN_GAP_MS)],
  );
  if (Number(recent?.count) > 0) {
    throw new HttpError(
      429,
      "Un message vient d'être envoyé avec cette adresse. Patientez quelques secondes.",
    );
  }

  const today = await one(
    `SELECT COUNT(*)::int AS count FROM investor_inquiries WHERE email = $1 AND "receivedAt" > $2`,
    [email, new Date(Date.now() - DAY)],
  );
  if (Number(today?.count) >= EMAIL_LIMIT_PER_DAY) {
    throw new HttpError(429, "Trop de messages ont été envoyés avec cette adresse. Réessayez plus tard.");
  }

  await query(
    `INSERT INTO investor_inquiries (email, type, message, status, "ipHash", name, phone, "projectId", "projectTitle") VALUES ($1,$2,$3,'nouveau',$4,$5,$6,$7,$8)`,
    [email, type, message, ipHash, name, phone, projectId, projectTitle],
  );
  return { ok: true as const };
}

export async function listInquiries(type?: string | null, status?: string | null) {
  if (type && type !== "proposition" && type !== "question") {
    throw new HttpError(400, "Type de filtre invalide.");
  }
  if (status && status !== "nouveau" && status !== "traité") {
    throw new HttpError(400, "Statut de filtre invalide.");
  }
  const filters: string[] = [];
  const params: unknown[] = [];
  if (type) {
    params.push(type);
    filters.push(`type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    filters.push(`status = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return query(
    `SELECT ${PUBLIC_COLUMNS} FROM investor_inquiries ${where} ORDER BY "receivedAt" DESC`,
    params,
  );
}

export async function markInquiryHandled(id: string, body: Record<string, unknown>) {
  if (!isUuid(id)) throw new HttpError(404, "Demande introuvable");
  if (body.status !== "traité") {
    throw new HttpError(400, "Le statut ne peut être marqué que comme traité.");
  }
  const inquiry = await one(
    `UPDATE investor_inquiries SET status = 'traité' WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id],
  );
  if (!inquiry) throw new HttpError(404, "Demande introuvable");
  return inquiry;
}

export async function removeInquiry(id: string) {
  if (!isUuid(id)) throw new HttpError(404, "Demande introuvable");
  const existing = await one(`SELECT id FROM investor_inquiries WHERE id = $1`, [id]);
  if (!existing) throw new HttpError(404, "Demande introuvable");
  await query(`DELETE FROM investor_inquiries WHERE id = $1`, [id]);
  return { deleted: true };
}

async function throttle(ipHash: string) {
  await query(`DELETE FROM inquiry_throttles WHERE "createdAt" < $1`, [new Date(Date.now() - 2 * DAY)]);
  const recent = await one(
    `SELECT COUNT(*)::int AS count FROM inquiry_throttles WHERE "ipHash" = $1 AND "createdAt" > $2`,
    [ipHash, new Date(Date.now() - HOUR)],
  );
  if (Number(recent?.count) >= IP_LIMIT_PER_HOUR) {
    throw new HttpError(429, "Trop de messages ont été envoyés. Réessayez plus tard.");
  }
  await query(`INSERT INTO inquiry_throttles ("ipHash") VALUES ($1)`, [ipHash]);
}
