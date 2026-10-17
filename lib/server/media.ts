import { randomUUID } from "crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { NextRequest } from "next/server";
import { HttpError } from "./http";

const MAX_BYTES = 4 * 1024 * 1024;

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configure() {
  if (!configured()) {
    throw new HttpError(
      500,
      "Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the Vercel environment variables.",
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function uploadBuffer(buffer: Buffer, folder: string) {
  configure();
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error || new HttpError(500, "Image upload failed."));
          return;
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function destroyImage(publicId: string | null | undefined) {
  if (!publicId || !configured()) return;
  try {
    configure();
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Image cleanup must not block the record change.
  }
}

export async function readImage(req: NextRequest, audience: "service" | "project") {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(
      400,
      "Image file is required.",
    );
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new HttpError(
      400,
      "Image file is required.",
    );
  }
  if (!file.type?.startsWith("image/")) {
    throw new HttpError(
      400,
      audience === "service" ? "Only image files are allowed." : "Only image files are allowed",
    );
  }
  if (file.size > MAX_BYTES) {
    throw new HttpError(
      400,
      audience === "service"
        ? "The image exceeds 4 MB. Please reduce the file size before uploading."
        : "Image must be 4 MB or smaller.",
    );
  }
  return Buffer.from(await file.arrayBuffer());
}

export function normalizeLink(link: unknown) {
  if (link == null) return null;
  const value = String(link).trim();
  if (!value) return null;
  if (value.length > 500) {
    throw new HttpError(400, "The link is too long.");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "The link must be a valid http or https URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "The link must start with http:// or https://.");
  }
  return value;
}

export function normalizeImageUrl(url: unknown) {
  if (url == null) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (value.length > 2000) {
    throw new HttpError(400, "The image URL is too long.");
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(400, "The image URL is invalid.");
  }
  if (parsed.protocol !== "https:") {
    throw new HttpError(400, "The image must be served over HTTPS.");
  }
  return value;
}

export function normalizePublicId(value: unknown, max = 512) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.length > max) throw new HttpError(400, "Image identifier is too long.");
  return trimmed;
}

const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

export function normalizeDriveLink(link: unknown) {
  if (link == null) return null;
  const value = String(link).trim();
  if (!value) return null;
  if (value.length > 500) throw new HttpError(400, "The Drive link is too long.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "The Drive link must be a valid URL.");
  }
  if (url.protocol !== "https:" || !DRIVE_HOSTS.has(url.hostname)) {
    throw new HttpError(400, "The presentation link must be a Google Drive link (https://drive.google.com/…).");
  }
  return value;
}

export const ATTACHMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "webp",
];
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_TOTAL_BYTES = 4 * 1024 * 1024;

export type StoredAttachment = {
  name: string;
  size: number;
  publicId: string;
};

function extensionOf(name: string) {
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(name);
  return match ? match[1].toLowerCase() : "";
}

function safeBaseName(name: string) {
  const base = name
    .replace(/\.[A-Za-z0-9]{1,8}$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "file";
}

export function checkAttachments(files: File[]) {
  if (files.length > MAX_ATTACHMENTS) {
    throw new HttpError(400, `You can attach up to ${MAX_ATTACHMENTS} files.`);
  }
  let total = 0;
  for (const file of files) {
    const ext = extensionOf(file.name);
    if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
      throw new HttpError(
        400,
        `“${file.name}” is not an accepted file type. Accepted: ${ATTACHMENT_EXTENSIONS.join(", ")}.`,
      );
    }
    total += file.size;
  }
  if (total > MAX_ATTACHMENT_TOTAL_BYTES) {
    throw new HttpError(400, "The attached files exceed 4 MB in total. Please reduce them or send fewer files.");
  }
}

export async function storeAttachments(files: File[]) {
  if (!files.length) return [] as StoredAttachment[];
  configure();
  const stored: StoredAttachment[] = [];
  try {
    for (const file of files) {
      const ext = extensionOf(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const publicId = `hannon/inquiries/${randomUUID()}/${safeBaseName(file.name)}.${ext}`;
      await new Promise<void>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: publicId, resource_type: "raw", type: "authenticated", overwrite: false },
          (error, result) => (error || !result ? reject(error || new Error("upload failed")) : resolve()),
        );
        stream.end(buffer);
      });
      stored.push({ name: file.name.slice(0, 200), size: file.size, publicId });
    }
  } catch (error) {
    await destroyAttachments(stored);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, "The attached files could not be uploaded. Please try again.");
  }
  return stored;
}

export async function destroyAttachments(items: { publicId?: string }[]) {
  if (!configured()) return;
  try {
    configure();
    await Promise.all(
      items
        .filter((item) => item.publicId)
        .map((item) =>
          cloudinary.uploader.destroy(item.publicId as string, { resource_type: "raw", type: "authenticated" }),
        ),
    );
  } catch {
    // Cleanup must not block the record change.
  }
}

export function attachmentUrl(publicId: string) {
  if (!configured()) return null;
  configure();
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "authenticated",
    sign_url: true,
    secure: true,
  });
}
