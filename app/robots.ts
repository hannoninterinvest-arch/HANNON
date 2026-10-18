import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /login and /register stay crawlable on purpose so search engines can read their noindex rule.
        disallow: ["/admin", "/api/", "/dashboard"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
