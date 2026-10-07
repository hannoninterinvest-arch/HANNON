import { NextResponse } from "next/server";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function fail(error: unknown) {
  if (error instanceof HttpError) {
    return ok({ message: error.message, statusCode: error.status }, error.status);
  }
  console.error(error);
  const text = error instanceof Error ? error.message : "";
  if (/ECONNREFUSED|ENOTFOUND|password authentication|no pg_hba|SSL/.test(text)) {
    return ok(
      {
        message: "Connexion à PostgreSQL impossible. Vérifiez DATABASE_URL sur Vercel.",
        statusCode: 500,
      },
      500,
    );
  }
  return ok({ message: "Erreur interne du serveur.", statusCode: 500 }, 500);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function has(body: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(body, key);
}
