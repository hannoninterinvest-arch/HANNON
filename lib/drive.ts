export type DriveLinks = {
  previewUrl: string | null;
  downloadUrl: string | null;
  viewUrl: string;
};

function fileIdOf(url: URL) {
  const path = /\/d\/([A-Za-z0-9_-]{10,})/.exec(url.pathname);
  if (path) return path[1];
  const param = url.searchParams.get("id");
  if (param && /^[A-Za-z0-9_-]{10,}$/.test(param)) return param;
  return null;
}

export function driveLinks(raw: string | null | undefined): DriveLinks | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !["drive.google.com", "docs.google.com"].includes(url.hostname)) {
    return null;
  }
  const id = fileIdOf(url);
  if (!id || url.pathname.includes("/folders/")) {
    return { previewUrl: null, downloadUrl: null, viewUrl: url.toString() };
  }
  return {
    previewUrl: `https://drive.google.com/file/d/${id}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
    viewUrl: `https://drive.google.com/file/d/${id}/view`,
  };
}
