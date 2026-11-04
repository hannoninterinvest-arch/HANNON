"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HannonService, Project } from "@/lib/types";
import { HOME_PROJECTS, pickHome } from "@/lib/home";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import { useLocale } from "./LocaleProvider";

type Slide = { id:string; kind:"project"|"service"; title:string; description:string; href:string; imageUrl:string|null; meta:string };

export default function ProjectsSection({ projects, services }: { projects: Project[]; services: HannonService[] }) {
  const { t } = useLocale();
  const [activeIndex,setActiveIndex] = useState(0);
  const [paused,setPaused] = useState(false);
  const slides = useMemo<Slide[]>(() => {
    const projectSlides=projects.map(p=>({id:p.id,kind:"project" as const,title:p.title,description:p.summary||p.description,href:`/projects/${p.id}`,imageUrl:p.imageUrl,meta:`${p.sector} · ${p.location}`}));
    const serviceSlides=services.map(s=>({id:s.id,kind:"service" as const,title:s.name,description:s.description,href:`/services/${s.slug}`,imageUrl:s.imageUrl,meta:s.name}));
    const mixed:Slide[]=[];
    for(let i=0;i<Math.max(projectSlides.length,serviceSlides.length);i++){
      if(projectSlides[i]) mixed.push(projectSlides[i]);
      if(serviceSlides[i]) mixed.push(serviceSlides[i]);
    }
    return mixed;
  },[projects,services]);
  const featured = pickHome(projects, HOME_PROJECTS);
  const active = slides.length ? slides[activeIndex % slides.length] : null;

  useEffect(() => {
    if(paused||slides.length<2) return;
    const timer=window.setInterval(()=>setActiveIndex(i=>(i+1)%slides.length),6500);
    return ()=>window.clearInterval(timer);
  },[paused,slides.length]);

  useEffect(() => {
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(media.matches) setPaused(true);
    const onChange=(event:MediaQueryListEvent)=>{if(event.matches) setPaused(true);};
    media.addEventListener("change",onChange);
    return ()=>media.removeEventListener("change",onChange);
  },[]);

  const step=(delta:number)=>setActiveIndex(i=>(i+delta+slides.length)%slides.length);

  return <section id="projects" className="overflow-hidden bg-[#fdf0e0] py-16 sm:py-24">
    <div className="section-pad mx-auto max-w-wrap">
      <Reveal className="mb-10 flex flex-col gap-5 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="eyebrow">{t("projectsEyebrow")}</div><h2 className="display mt-4 max-w-2xl text-[34px] text-[#061439] sm:text-[46px]">{t("projectsTitle")}</h2><p className="mt-4 max-w-2xl text-[15px] leading-[1.9] text-[#536079]">{t("projectsBody")}</p></div>
        <Link href="/projects" className="btn btn-outline-navy shrink-0">{t("viewProjects")} <span aria-hidden>←</span></Link>
      </Reveal>

      {active && <Reveal className="mb-12">
        <div className="mb-4 flex items-center justify-between gap-4"><div className="eyebrow">{t("spotlightHeading")}</div>
          <div className="flex items-center gap-2"><button type="button" onClick={()=>setPaused(p=>!p)} className="rounded-full border border-[#061439]/15 px-3 py-2 text-[11px] font-semibold text-[#33415f] transition hover:border-[#d8af6a] hover:bg-white" aria-label={paused?t("resumeShowcase"):t("pauseShowcase")}>{paused?t("resumeShowcase"):t("pauseShowcase")}</button>
          <button type="button" onClick={()=>step(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#061439]/15 bg-white text-[#061439] transition hover:border-[#d8af6a] hover:bg-[#061439] hover:text-white" aria-label={t("previous")}>←</button>
          <button type="button" onClick={()=>step(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#061439]/15 bg-white text-[#061439] transition hover:border-[#d8af6a] hover:bg-[#061439] hover:text-white" aria-label={t("next")}>→</button></div>
        </div>
        <div className="featured-frame grid min-h-[360px] overflow-hidden rounded-[28px] border border-[#d8af6a]/45 bg-[#061439] shadow-[0_26px_70px_rgba(6,20,57,.18)] lg:grid-cols-[1.05fr_.95fr]" role="region" aria-roledescription="carousel" aria-label={t("spotlightHeading")}>
          <div key={`${active.id}-image`} className="featured-image relative min-h-[260px] overflow-hidden bg-[#0b204d] lg:min-h-[430px]">
            {active.imageUrl ? <Image src={active.imageUrl} alt={active.title} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover"/> : <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_70%_25%,rgba(216,175,106,.3),transparent_40%),linear-gradient(140deg,#0b204d,#061439)]"><span className="font-serif text-8xl font-semibold tracking-widest text-[#d8af6a]/40">H</span></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-[#061439]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#061439]/10 lg:to-[#061439]/35"/>
            <span className="absolute bottom-5 left-5 rounded-full border border-[#e5c98f]/50 bg-[#061439]/75 px-4 py-2 text-xs font-semibold text-[#f0d29b] backdrop-blur">{active.kind==="project"?t("featuredProject"):t("featuredService")}</span>
          </div>
          <div key={`${active.id}-copy`} className="featured-copy flex flex-col justify-center p-6 text-white sm:p-9 lg:p-12">
            <div className="text-xs font-semibold uppercase tracking-[.18em] text-[#e5c98f]">{active.meta}</div>
            <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-[40px]">{active.title}</h3>
            <p className="mt-4 line-clamp-4 max-w-xl text-sm leading-[1.9] text-white/70 sm:text-base">{active.description}</p>
            <div className="mt-7 flex items-center justify-between gap-4">
              <Link href={active.href} className="inline-flex items-center gap-3 rounded-full bg-[#d8af6a] px-6 py-3 text-sm font-semibold text-[#061439] transition hover:-translate-y-0.5 hover:bg-[#f0d29b]">{t("viewFeatured")} <span aria-hidden>←</span></Link>
              <span className="font-serif text-sm tracking-widest text-white/55">{String((activeIndex%slides.length)+1).padStart(2,"0")} <span className="text-[#d8af6a]">/</span> {String(slides.length).padStart(2,"0")}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2" aria-label={t("spotlightHeading")}>{slides.map((slide,i)=><button key={`${slide.kind}-${slide.id}`} type="button" onClick={()=>setActiveIndex(i)} aria-label={`${t(slide.kind==="project"?"featuredProject":"featuredService")}: ${slide.title}`} aria-current={i===activeIndex?"true":undefined} className={`h-1.5 rounded-full transition-all duration-500 ${i===activeIndex?"w-9 bg-[#b58b4c]":"w-2 bg-[#061439]/20 hover:bg-[#b58b4c]/70"}`}/>)}</div>
      </Reveal>}

      {!active && <p className="mb-10 rounded-2xl border border-dashed border-[#d8af6a]/50 bg-white px-6 py-10 text-center text-sm text-[#536079]">{t("publishedProjects")}</p>}
      {featured.length>0 && <><div className="mb-6 flex items-end justify-between gap-4"><h3 className="font-serif text-2xl font-semibold text-[#061439] sm:text-3xl">{t("projectsEyebrow")}</h3><Link href="/projects" className="text-sm font-semibold text-[#806338] hover:text-[#061439]">{t("viewProjects")} →</Link></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">{featured.map((project,i)=><Reveal key={project.id} delay={i*80} className="project-card h-full"><ProjectCard project={project}/></Reveal>)}</div></>}
    </div>
  </section>;
}
