import { cache } from "react";
import { notFound } from "next/navigation";
import { HttpError } from "./http";
import { listPublishedServices, publishedBySlug } from "./catalog";
import { getProject, listVisibleProjects } from "./projects";
import type { HannonService, Project } from "@/lib/types";

// Server components receive plain JSON so nothing driver-specific (Dates, numerics) crosses the client boundary.
const plain = <T>(value: unknown) => JSON.parse(JSON.stringify(value)) as T;

async function listOrEmpty<T>(load: () => Promise<unknown>) {
  try {
    return plain<T[]>(await load());
  } catch (error) {
    console.error("Public data unavailable:", error instanceof Error ? error.message : error);
    return [] as T[];
  }
}

export const getPublishedServices = cache(() => listOrEmpty<HannonService>(listPublishedServices));
export const getVisibleProjects = cache(() => listOrEmpty<Project>(listVisibleProjects));

async function oneOrNotFound<T>(load: () => Promise<unknown>) {
  try {
    return plain<T>(await load());
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
}

export const getPublishedService = cache((slug: string) =>
  oneOrNotFound<HannonService>(() => publishedBySlug(slug)),
);
export const getPublicProject = cache((id: string) => oneOrNotFound<Project>(() => getProject(id, true)));
