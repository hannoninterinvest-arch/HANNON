"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Project[]>("/projects")
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="bg-ivory py-16">
      <div className="mx-auto max-w-wrap px-6 lg:px-10">
        <div className="eyebrow">Mandates</div>
        <h1 className="mt-2 font-serif text-4xl text-navy-900">
          Investment projects
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-muted-dark">
          Explore live opportunities originated and structured by HANNON.
          Approved investors may submit a request on each visible mandate.
        </p>
        {error && <p className="mt-6 text-sm text-[#8a2a2a]">{error}</p>}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
