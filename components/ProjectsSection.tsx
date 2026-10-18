import Link from "next/link";
import type { Project } from "@/lib/types";
import { HOME_PROJECTS, pickHome } from "@/lib/home";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
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

        {projects.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gold-500/40 bg-white px-6 py-10 text-center text-sm font-light text-muted-dark">
            Investment opportunities will be published here.
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
