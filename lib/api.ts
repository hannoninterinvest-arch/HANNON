const API = "/api";

function messageFrom(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const message = (data as { message?: unknown }).message;
  if (Array.isArray(message)) return message.join(". ");
  if (typeof message === "string") return message;
  return fallback;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hannon_token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API}${path}`, { cache: "no-store", ...options, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(messageFrom(data, `Request failed (${res.status})`));
  }
  return data as T;
}

export const money = (value: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const pct = (value: string | number) => `${Number(value).toFixed(1)}%`;

export async function uploadServiceImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  return api<{ imageUrl: string; cloudinaryPublicId: string }>("/services/upload", {
    method: "POST",
    body,
  });
}

export const progressOf = (raised: string | number, target: string | number) => {
  const t = Number(target);
  if (!t) return 0;
  return Math.min(100, Math.round((Number(raised) / t) * 100));
};
