import type { MetadataRoute } from "next";
import { HOME_DESCRIPTION, SHORT_NAME, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SHORT_NAME,
    description: HOME_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a1a30",
    theme_color: "#0a1a30",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
