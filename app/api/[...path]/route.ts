import type { NextRequest } from "next/server";
import { dispatch } from "@/lib/server/router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Context = { params: { path?: string[] } };

async function handle(req: NextRequest, context: Context) {
  return dispatch(req, context.params.path || []);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
