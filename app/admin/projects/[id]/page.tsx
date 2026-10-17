"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import ProjectForm from "@/components/ProjectForm";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    api<Project>(`/projects/admin/${params.id}`)
      .then(setProject)
      .catch((e) => setError(e instanceof Error ? e.message : "Project not found"));
  }, [params.id]);

  return (
    <DashboardShell title={project?.title || "Edit project"}>
      <div className="mb-5">
        <Link
          href="/admin/projects"
          className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-500 hover:text-gold-400"
        >
          ← All projects
        </Link>
      </div>
      {error && <p className="text-sm text-[#8a2a2a]">{error}</p>}
      {!project && !error && <p className="text-sm text-muted-dark">Loading…</p>}
      {project && <ProjectForm project={project} />}
    </DashboardShell>
  );
}
