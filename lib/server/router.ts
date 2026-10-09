import type { NextRequest } from "next/server";
import {
  clientIp,
  hashIp,
  listInvestors,
  login,
  publicUser,
  register,
  requireAdmin,
  updateInvestorStatus,
} from "./auth";
import {
  addPlatform,
  createService,
  getAdminService,
  listAdminServices,
  listPublishedServices,
  publishedBySlug,
  removePlatform,
  removeService,
  updatePlatform,
  updateService,
  uploadServiceImage,
} from "./catalog";
import { one, query, ensureReady } from "./db";
import { fail, HttpError, ok } from "./http";
import { createInquiry, listInquiries, markInquiryHandled, removeInquiry } from "./inquiries";
import { createInvestment, listInvestments, listMyInvestments, updateInvestmentStatus } from "./investments";
import {
  attachProjectImage,
  createProject,
  getProject,
  listAllProjects,
  listVisibleProjects,
  removeProject,
  updateProject,
  uploadProjectImage,
} from "./projects";

type User = { id: string };
type Handler = (
  req: NextRequest,
  params: Record<string, string>,
  user: User | null,
) => Promise<unknown>;

const routes: { method: string; pattern: string; auth: boolean; handle: Handler }[] = [
  { method: "GET", pattern: "health", auth: false, handle: async () => ({ ok: true, service: "hannon-api" }) },
  { method: "POST", pattern: "auth/register", auth: false, handle: async () => register() },
  { method: "POST", pattern: "auth/login", auth: false, handle: async (req) => login(await readJson(req)) },
  {
    method: "GET",
    pattern: "auth/me",
    auth: true,
    handle: async (_req, _params, user) => publicUser(user || {}),
  },

  { method: "GET", pattern: "users/investors", auth: true, handle: async () => listInvestors() },
  {
    method: "PATCH",
    pattern: "users/:id/status",
    auth: true,
    handle: async (req, params) => updateInvestorStatus(params.id, await readJson(req)),
  },

  ...(["projects", "services"] as const).map((table) => ({
    method: "PATCH", pattern: `${table}/:id/home`, auth: true,
    handle: async (req: NextRequest, params: Record<string, string>) => {
      const body = await readJson(req);
      const slot = body.homeSlot;
      if (slot !== null && (typeof slot !== "number" || !Number.isInteger(slot) || slot < 1 || slot > 6)) {
        throw new HttpError(400, "Choisissez une position de 1 à 6.");
      }
      const current = await one(`SELECT id FROM ${table} WHERE id::text = $1`, [params.id]);
      if (!current) throw new HttpError(404, "Élément introuvable.");
      try {
        await query(`UPDATE ${table} SET "homeSlot" = $2 WHERE id::text = $1`, [params.id, slot]);
      } catch (error) {
        if ((error as { code?: string }).code === "23505") throw new HttpError(409, "Cette position est occupée. Retirez d'abord l'élément qui l'occupe.");
        throw error;
      }
      return { ok: true };
    },
  })),
  { method: "GET", pattern: "projects", auth: false, handle: async () => listVisibleProjects() },
  { method: "GET", pattern: "projects/admin/all", auth: true, handle: async () => listAllProjects() },
  { method: "GET", pattern: "projects/admin/:id", auth: true, handle: async (_req, params) => getProject(params.id, false) },
  { method: "GET", pattern: "projects/:id", auth: false, handle: async (_req, params) => getProject(params.id, true) },
  { method: "POST", pattern: "projects", auth: true, handle: async (req) => createProject(await readJson(req)) },
  { method: "POST", pattern: "projects/upload", auth: true, handle: async (req) => uploadProjectImage(req) },
  { method: "POST", pattern: "projects/:id/image", auth: true, handle: async (req, params) => attachProjectImage(params.id, req) },
  { method: "PATCH", pattern: "projects/:id", auth: true, handle: async (req, params) => updateProject(params.id, await readJson(req)) },
  { method: "DELETE", pattern: "projects/:id", auth: true, handle: async (_req, params) => removeProject(params.id) },

  { method: "GET", pattern: "services", auth: false, handle: async () => listPublishedServices() },
  { method: "GET", pattern: "services/by-slug/:slug", auth: false, handle: async (_req, params) => publishedBySlug(params.slug) },
  { method: "GET", pattern: "services/admin/all", auth: true, handle: async () => listAdminServices() },
  { method: "GET", pattern: "services/admin/:id", auth: true, handle: async (_req, params) => getAdminService(params.id) },
  { method: "POST", pattern: "services", auth: true, handle: async (req) => createService(await readJson(req)) },
  { method: "POST", pattern: "services/upload", auth: true, handle: async (req) => uploadServiceImage(req) },
  { method: "PATCH", pattern: "services/:id", auth: true, handle: async (req, params) => updateService(params.id, await readJson(req)) },
  { method: "DELETE", pattern: "services/:id", auth: true, handle: async (_req, params) => removeService(params.id) },
  { method: "POST", pattern: "services/:id/platforms", auth: true, handle: async (req, params) => addPlatform(params.id, await readJson(req)) },
  {
    method: "PATCH",
    pattern: "services/:id/platforms/:platformId",
    auth: true,
    handle: async (req, params) => updatePlatform(params.id, params.platformId, await readJson(req)),
  },
  {
    method: "DELETE",
    pattern: "services/:id/platforms/:platformId",
    auth: true,
    handle: async (_req, params) => removePlatform(params.id, params.platformId),
  },

  { method: "POST", pattern: "inquiries", auth: false, handle: async (req) => createInquiry(await readJson(req), hashIp(clientIp(req))) },
  {
    method: "GET",
    pattern: "inquiries",
    auth: true,
    handle: async (req) => listInquiries(req.nextUrl.searchParams.get("type"), req.nextUrl.searchParams.get("status")),
  },
  {
    method: "PATCH",
    pattern: "inquiries/:id/status",
    auth: true,
    handle: async (req, params) => markInquiryHandled(params.id, await readJson(req)),
  },
  { method: "DELETE", pattern: "inquiries/:id", auth: true, handle: async (_req, params) => removeInquiry(params.id) },

  { method: "GET", pattern: "investments", auth: true, handle: async () => listInvestments() },
  { method: "GET", pattern: "investments/me", auth: true, handle: async (_req, _params, user) => listMyInvestments(user!.id) },
  {
    method: "POST",
    pattern: "investments",
    auth: true,
    handle: async (req, _params, user) => createInvestment(user!.id, await readJson(req)),
  },
  {
    method: "PATCH",
    pattern: "investments/:id/status",
    auth: true,
    handle: async (req, params) => updateInvestmentStatus(params.id, await readJson(req)),
  },
];

export async function dispatch(req: NextRequest, path: string[]) {
  try {
    await ensureReady();
    for (const route of routes) {
      if (route.method !== req.method) continue;
      const params = match(path, route.pattern);
      if (!params) continue;
      const user = route.auth ? await requireAdmin(req) : null;
      return ok(await route.handle(req, params, user));
    }
    const known = routes.some((route) => match(path, route.pattern));
    throw new HttpError(known ? 405 : 404, known ? "Method not allowed" : "Not found");
  } catch (error) {
    return fail(error);
  }
}

function match(path: string[], pattern: string) {
  const parts = pattern.split("/").filter(Boolean);
  if (parts.length !== path.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i].startsWith(":")) params[parts[i].slice(1)] = path[i];
    else if (parts[i] !== path[i]) return null;
  }
  return params;
}

async function readJson(req: NextRequest) {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new HttpError(400, "JSON invalide.");
    }
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "JSON invalide.");
  }
}
