"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import { HOME_PROJECTS, pickHome } from "@/lib/home";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Project[]>("/projects")
      .then(setProjects)
      .catch(() => setError("Investment opportunities will appear once the API is connected."));
  }, []);

  return (
    <section id="projects" className="relative bg-ivory py-16 sm:py-24">
      <div className="section-pad mx-auto max-w-wrap">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">Investment Projects</div>
            <h2 className="display mt-4 text-[34px] uppercase text-navy-900 sm:text-[46px]">
              Selected Opportunities.
              <br />
              <span className="gold-text">Institutional Access.</span>
            </h2>
          </div>
          <Link href="/projects" className="btn btn-outline-navy w-full sm:w-fit">
            View all projects <span aria-hidden>→</span>
          </Link>
        </Reveal>

        {error && (
          <p className="rounded-2xl border border-gold-500/30 bg-white px-5 py-4 text-sm text-muted-dark">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {pickHome(projects, HOME_PROJECTS).map((project, i) => (
            <Reveal key={project.id} delay={i * 100} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        {projects.length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/projects" className="btn btn-gold w-full sm:w-fit">
              Browse all {projects.length} project{projects.length > 1 ? "s" : ""} <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
