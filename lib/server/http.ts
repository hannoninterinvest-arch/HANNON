import { NextResponse } from "next/server";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function isHttpError(error: unknown): error is HttpError {
  if (error instanceof HttpError) return true;
  if (!error || typeof error !== "object") return false;
  const value = error as { name?: string; status?: unknown; message?: unknown };
  return value.name === "HttpError" && typeof value.status === "number" && typeof value.message === "string";
}

function safeText(error: unknown) {
  const text = error instanceof Error ? error.message : "";
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://…")
    .replace(/password[=:]\S+/gi, "password=…")
    .slice(0, 400);
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function fail(error: unknown) {
  if (isHttpError(error)) {
    return ok({ message: error.message, statusCode: error.status }, error.status);
  }
  console.error(error);
  const text = safeText(error);
  if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|password authentication|no pg_hba|certificate|SSL|channel_binding|Invalid URL/i.test(text)) {
    return ok(
      {
        message: `Connexion à PostgreSQL impossible. Vérifiez DATABASE_URL sur Vercel. ${text}`.trim(),
        statusCode: 500,
      },
      500,
    );
  }
  return ok(
    { message: text || "Erreur interne du serveur.", statusCode: 500 },
    500,
  );
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function has(body: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(body, key);
}
