import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { one, query } from "./db";
import { HttpError, isUuid } from "./http";

type UserRow = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string | null;
  role: "admin" | "investor";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

const PUBLIC_COLUMNS = `id, email, "firstName", "lastName", company, phone, role, status, "createdAt", "updatedAt"`;

function secret() {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}

export function publicUser(user: UserRow | Record<string, unknown>) {
  const { password: _password, ...safe } = user as UserRow & { password?: string };
  return safe;
}

export async function register() {
  throw new HttpError(
    403,
    "La création de comptes investisseurs est désactivée. Envoyez votre proposition ou votre question via le formulaire de contact.",
  );
}

export async function login(body: Record<string, unknown>) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    throw new HttpError(401, "Invalid credentials");
  }
  const user = await one<UserRow>(
    `SELECT id, email, password, "firstName", "lastName", company, phone, role, status, "createdAt", "updatedAt"
     FROM users WHERE email = $1`,
    [email],
  );
  if (!user || !user.password) throw new HttpError(401, "Invalid credentials");
  let matches = false;
  try {
    matches = await bcrypt.compare(password, user.password);
  } catch {
    matches = false;
  }
  if (!matches) throw new HttpError(401, "Invalid credentials");
  if (user.role !== "admin") {
    throw new HttpError(
      401,
      "La connexion réservée aux investisseurs n'est plus disponible. Envoyez votre proposition ou votre question via le formulaire de contact.",
    );
  }
  const payload = { sub: user.id, email: user.email, role: user.role };
  const requested = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  let token: string;
  try {
    token = jwt.sign(payload, secret(), { expiresIn: requested });
  } catch {
    token = jwt.sign(payload, secret(), { expiresIn: "7d" });
  }
  return { token, user: publicUser(user) };
}

export async function requireAdmin(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "Unauthorized");
  let payload: { sub?: string };
  try {
    payload = jwt.verify(token, secret()) as { sub?: string };
  } catch {
    throw new HttpError(401, "Unauthorized");
  }
  if (!payload.sub || !isUuid(payload.sub)) throw new HttpError(401, "Unauthorized");
  const user = await one<UserRow>(
    `SELECT id, email, "firstName", "lastName", company, phone, role, status, "createdAt", "updatedAt"
     FROM users WHERE id = $1`,
    [payload.sub],
  );
  if (!user) throw new HttpError(401, "Unauthorized");
  if (user.role !== "admin") {
    throw new HttpError(401, "La connexion réservée aux investisseurs n'est plus disponible.");
  }
  return user;
}

export async function listInvestors() {
  return query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE role = 'investor' ORDER BY "createdAt" DESC`,
  );
}

export async function updateInvestorStatus(id: string, body: Record<string, unknown>) {
  if (!isUuid(id)) throw new HttpError(400, "Identifiant invalide.");
  const status = body.status;
  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    throw new HttpError(400, "Statut invalide.");
  }
  const user = await one<UserRow>(
    `SELECT id, email, "firstName", "lastName", company, phone, role, status, "createdAt", "updatedAt"
     FROM users WHERE id = $1`,
    [id],
  );
  if (!user || user.role !== "investor") throw new HttpError(404, "Investor not found");
  const updated = await one(
    `UPDATE users SET status = $2, "updatedAt" = now() WHERE id = $1 AND role = 'investor'
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, status],
  );
  return updated;
}

export function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${ip}|${process.env.JWT_SECRET || "hannon-inquiry"}`)
    .digest("hex");
}
