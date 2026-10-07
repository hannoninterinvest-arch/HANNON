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
      "Le stockage d'images n'est pas configuré. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d'environnement Vercel.",
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
          reject(error || new HttpError(500, "L'envoi de l'image a échoué."));
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
      audience === "service"
        ? "Le fichier image est obligatoire."
        : "Image file is required",
    );
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new HttpError(
      400,
      audience === "service" ? "Le fichier image est obligatoire." : "Image file is required",
    );
  }
  if (!file.type?.startsWith("image/")) {
    throw new HttpError(
      400,
      audience === "service" ? "Seules les images sont acceptées." : "Only image files are allowed",
    );
  }
  if (file.size > MAX_BYTES) {
    throw new HttpError(
      400,
      audience === "service"
        ? "L'image dépasse 4 Mo. Réduisez le fichier avant de l'envoyer."
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
    throw new HttpError(400, "Le lien est trop long.");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "Le lien doit être une URL http ou https valide.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "Le lien doit commencer par http:// ou https://.");
  }
  return value;
}

export function normalizeImageUrl(url: unknown) {
  if (url == null) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (value.length > 2000) {
    throw new HttpError(400, "L'adresse de l'image est trop longue.");
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(400, "L'adresse de l'image est invalide.");
  }
  if (parsed.protocol !== "https:") {
    throw new HttpError(400, "L'image doit être servie en HTTPS.");
  }
  return value;
}

export function normalizePublicId(value: unknown, max = 512) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.length > max) throw new HttpError(400, "Identifiant d'image trop long.");
  return trimmed;
}
