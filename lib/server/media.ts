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
