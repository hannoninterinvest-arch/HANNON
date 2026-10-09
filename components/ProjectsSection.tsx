"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Project[]>("/projects")
      .then(setProjects)
      .catch(() => setError("Investment opportunities will appear once the API is connected."));
  }, []);

  return (
    <section id="projects" className="bg-ivory py-16">
      <div className="mx-auto max-w-wrap px-10">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">Investment Projects</div>
            <h2 className="mt-2 text-[26px] font-bold uppercase leading-tight text-navy-900 sm:text-[30px]">
              Selected Opportunities.
              <br />
              <span className="text-gold-500">Institutional Access.</span>
            </h2>
          </div>
          <Link
            href="/projects"
            className="btn btn-outline-navy w-fit px-[22px] py-[11px] text-[10px]"
          >
            View all projects
          </Link>
        </div>

        {error && (
          <p className="rounded-[4px] border border-gold-500/30 bg-white px-5 py-4 text-sm text-muted-dark">
            {error}
          </p>
        )}

        {!error && !projects.some(p => p.homeSlot != null) && <p className="mb-4 text-sm text-muted-dark">Les projets sélectionnés par l’administrateur apparaîtront ici.</p>}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.filter(p => p.homeSlot != null).sort((a, b) => a.homeSlot! - b.homeSlot!).slice(0, 6).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
