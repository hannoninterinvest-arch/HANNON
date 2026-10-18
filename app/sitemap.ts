import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedServices, getVisibleProjects } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/global-reach", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects] = await Promise.all([getPublishedServices(), getVisibleProjects()]);

  return [
    ...STATIC_PAGES.map((page) => ({
      url: absoluteUrl(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.id}`),
      lastModified: project.updatedAt ? new Date(project.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
