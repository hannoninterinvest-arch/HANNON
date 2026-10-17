"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api, money } from "@/lib/api";
import type { Project } from "@/lib/types";
import { HOME_PROJECTS } from "@/lib/home";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

  async function load() {
    try {
      setError("");
      setProjects(await api<Project[]>("/projects/admin/all"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load projects");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next);
    setError("");
    try {
      await api("/projects/order", { method: "PUT", body: JSON.stringify({ ids: next.map((p) => p.id) }) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save the order");
      await load();
    }
  }

  async function toggleFeatured(project: Project) {
    setError("");
    try {
      await api(`/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !project.featured }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update the project");
    }
  }

  const featuredCount = projects.filter((p) => p.featured).length;

  async function remove(project: Project) {
    if (
      !confirm(
        `Delete “${project.title}”? Its statistics, investment requests and Cloudinary image are removed too. This action cannot be undone.`,
      )
    ) {
      return;
    }
    setError("");
    setDeleting(project.id);
    try {
      await api(`/projects/${project.id}`, { method: "DELETE" });
      setProjects((list) => list.filter((item) => item.id !== project.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete the project");
    } finally {
      setDeleting("");
    }
  }

  return (
    <DashboardShell title="Projects">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-dark">
          Order the projects with the arrows. Pick up to {HOME_PROJECTS} projects for the home page
          ({featuredCount}/{HOME_PROJECTS} selected). Without a selection, the first {HOME_PROJECTS} are shown.
        </p>
        <Link href="/admin/projects/new" className="btn btn-gold">
          Add project
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="card-shadow flex flex-col overflow-hidden rounded-[6px] bg-white md:flex-row"
          >
            <div className="relative h-40 w-full md:h-auto md:w-56">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full bg-navy-800" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-2xl">{project.title}</h3>
                <StatusBadge status={project.status} />
                {!project.visible && <StatusBadge status="closed" />}
                {project.featured && (
                  <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-gold-500">
                    Home page
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-dark">
                {project.sector} · {project.location} · {money(project.raisedAmount)} /{" "}
                {money(project.targetAmount)}
                {project.presentationUrl ? " · PDF presentation linked" : ""}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="h-7 w-7 rounded-full border border-[#e4dfd4] text-navy-800 hover:border-gold-500 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === projects.length - 1}
                    aria-label="Move down"
                    className="h-7 w-7 rounded-full border border-[#e4dfd4] text-navy-800 hover:border-gold-500 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <span className="ml-1 text-[11px] text-muted-dark">#{index + 1}</span>
                </span>
                {project.visible && (
                  <button
                    onClick={() => toggleFeatured(project)}
                    className="text-[11px] uppercase tracking-[1.5px] text-[#1f6b3a]"
                  >
                    {project.featured ? "Remove from home page" : "Show on home page"}
                  </button>
                )}
                <Link
                  href={`/projects/${project.id}`}
                  className="text-[11px] uppercase tracking-[1.5px] text-navy-800 hover:text-gold-500"
                >
                  View
                </Link>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="text-[11px] uppercase tracking-[1.5px] text-gold-500 hover:text-gold-400"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(project)}
                  disabled={deleting === project.id}
                  className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a] disabled:opacity-50"
                >
                  {deleting === project.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
