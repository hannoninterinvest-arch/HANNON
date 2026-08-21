"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api, money } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setProjects(await api<Project[]>("/projects/admin/all"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load projects");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this project and its Cloudinary image?")) return;
    await api(`/projects/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <DashboardShell title="Projects">
      <div className="mb-6 flex justify-end">
        <Link href="/admin/projects/new" className="btn btn-gold">
          Add project
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
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
              </div>
              <p className="text-sm text-muted-dark">
                {project.sector} · {project.location} · {money(project.raisedAmount)} /{" "}
                {money(project.targetAmount)}
              </p>
              <div className="mt-2 flex gap-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-[11px] uppercase tracking-[1.5px] text-navy-800 hover:text-gold-500"
                >
                  View
                </Link>
                <button
                  onClick={() => remove(project.id)}
                  className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a]"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
