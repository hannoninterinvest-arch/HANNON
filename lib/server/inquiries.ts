import { one, query } from "./db";
import { HttpError, isUuid } from "./http";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const IP_LIMIT_PER_HOUR = 8;
const EMAIL_LIMIT_PER_DAY = 5;
const MIN_GAP_MS = 20 * 1000;
const DEDUPE_MS = 2 * 60 * 1000;
const MIN_FILL_MS = 400;

const PUBLIC_COLUMNS = `id, email, type, message, "receivedAt", status`;

export async function createInquiry(body: Record<string, unknown>, ipHash: string) {
  await throttle(ipHash);
  const website = body.website;
  if (website != null && typeof website !== "string") {
    throw new HttpError(400, "Invalid request.");
  }
  if (typeof website === "string" && website.length > 200) {
    throw new HttpError(400, "Invalid request.");
  }
  if (typeof website === "string" && website.trim()) return { ok: true as const };

  if (body.startedAt != null && body.startedAt !== "") {
    const startedAt = Number(body.startedAt);
    if (!Number.isFinite(startedAt)) throw new HttpError(400, "Invalid request.");
    const elapsed = Date.now() - startedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
      throw new HttpError(400, "Please wait a moment before submitting the form.");
    }
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new HttpError(400, "Please enter a valid email address.");
  }
  const type = body.type;
  if (type !== "proposition" && type !== "question") {
    throw new HttpError(400, "Please choose Proposal or Question.");
  }
  const message = String(body.message ?? "").trim();
  if (message.length < 5) throw new HttpError(400, "The message must contain at least 5 characters.");
  if (message.length > 5000) throw new HttpError(400, "The message cannot exceed 5000 characters.");

  const duplicate = await one(
    `SELECT id FROM investor_inquiries
     WHERE email = $1 AND type = $2 AND message = $3 AND "receivedAt" > $4`,
    [email, type, message, new Date(Date.now() - DEDUPE_MS)],
  );
  if (duplicate) return { ok: true as const };

  const recent = await one(
    `SELECT COUNT(*)::int AS count FROM investor_inquiries WHERE email = $1 AND "receivedAt" > $2`,
    [email, new Date(Date.now() - MIN_GAP_MS)],
  );
  if (Number(recent?.count) > 0) {
    throw new HttpError(
      429,
      "A message was just sent from this address. Please wait a few seconds.",
    );
  }

  const today = await one(
    `SELECT COUNT(*)::int AS count FROM investor_inquiries WHERE email = $1 AND "receivedAt" > $2`,
    [email, new Date(Date.now() - DAY)],
  );
  if (Number(today?.count) >= EMAIL_LIMIT_PER_DAY) {
    throw new HttpError(429, "Too many messages were sent from this address. Please try again later.");
  }

  await query(
    `INSERT INTO investor_inquiries (email, type, message, status, "ipHash") VALUES ($1,$2,$3,'nouveau',$4)`,
    [email, type, message, ipHash],
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
  if (!isUuid(id)) throw new HttpError(404, "Request not found");
  if (body.status !== "traité") {
    throw new HttpError(400, "The status can only be set to handled.");
  }
  const inquiry = await one(
    `UPDATE investor_inquiries SET status = 'traité' WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id],
  );
  if (!inquiry) throw new HttpError(404, "Request not found");
  return inquiry;
}

export async function removeInquiry(id: string) {
  if (!isUuid(id)) throw new HttpError(404, "Request not found");
  const existing = await one(`SELECT id FROM investor_inquiries WHERE id = $1`, [id]);
  if (!existing) throw new HttpError(404, "Request not found");
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
    throw new HttpError(429, "Too many messages were sent. Please try again later.");
  }
  await query(`INSERT INTO inquiry_throttles ("ipHash") VALUES ($1)`, [ipHash]);
}
