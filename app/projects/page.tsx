"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Project[]>("/projects")
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main>
      <PageHeader
        eyebrow="Mandates"
        title={
          <>
            Investment <span className="gold-text">projects</span>
          </>
        }
        description="Explore live opportunities originated and structured by HANNON."
      />
      <div className="bg-ivory py-12 sm:py-16">
        <div className="section-pad mx-auto max-w-wrap">
          {error && <p className="text-sm text-[#8a2a2a]">{error}</p>}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={(i % 3) * 90} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
