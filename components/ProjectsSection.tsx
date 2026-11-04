"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { HOME_PROJECTS, pickHome } from "@/lib/home";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import { useLocale } from "./LocaleProvider";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t } = useLocale();
  const featured = pickHome(projects, HOME_PROJECTS);
  return <section id="projects" className="overflow-hidden bg-[#fdf0e0] py-16 sm:py-24">
    <div className="section-pad mx-auto max-w-wrap">
      <Reveal className="mb-10 flex flex-col gap-5 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="eyebrow">{t("projectsEyebrow")}</div><h2 className="display mt-4 max-w-2xl text-[34px] text-[#061439] sm:text-[46px]">{t("projectsTitle")}</h2><p className="mt-4 max-w-2xl text-[15px] leading-[1.9] text-[#536079]">{t("projectsBody")}</p></div>
        <Link href="/projects" className="btn btn-outline-navy shrink-0">{t("viewProjects")} <span aria-hidden>←</span></Link>
      </Reveal>
      {projects.length===0 && <p className="rounded-2xl border border-dashed border-[#d8af6a]/50 bg-white px-6 py-10 text-center text-sm text-[#536079]">{t("publishedProjects")}</p>}
      {projects.length>0 && <div className="project-marquee mb-7 rounded-2xl border border-[#d8af6a]/30 bg-white/70 py-3.5" aria-label={t("projectsEyebrow")}><div className="project-marquee-track">{[...projects,...projects].map((p,i)=><span key={`${p.id}-${i}`} className="inline-flex items-center gap-3 px-5 text-xs font-semibold text-[#34415c]"><i className="h-1.5 w-1.5 rounded-full bg-[#c49b59]"/>{p.title}</span>)}</div></div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">{featured.map((project,i)=><Reveal key={project.id} delay={i*80} className="project-card h-full"><ProjectCard project={project}/></Reveal>)}</div>
      {projects.length>0 && <div className="mt-10 text-center"><Link href="/projects" className="btn btn-gold">{t("viewProjects")} <span aria-hidden>←</span></Link></div>}
    </div>
  </section>;
}
