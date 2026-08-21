"use client";

import Image from "next/image";
import Link from "next/link";
import { money, pct, progressOf } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  const progress = progressOf(project.raisedAmount, project.targetAmount);

  return (
    <article className="card-shadow card-shadow-hover group flex h-full flex-col overflow-hidden rounded-[6px] bg-white">
      <div className="relative h-48 overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-navy-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-[2px] bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-navy-800">
          {project.sector}
        </span>
        <span className="absolute bottom-4 left-4 text-[11px] uppercase tracking-[1.5px] text-gold-400">
          {project.location}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 py-5">
        <h3 className="font-serif text-[22px] font-semibold leading-snug text-navy-900">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13.5px] font-light leading-relaxed text-muted-dark">
          {project.summary || project.description}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-[11px] uppercase tracking-[1px] text-muted-dark">
            <span>Capital raised</span>
            <span className="text-navy-800">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#efebe3]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-[12.5px] text-muted-dark">
            {money(project.raisedAmount)} of {money(project.targetAmount)}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#efebe3] pt-4">
          <div>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted-dark">
              Target return
            </div>
            <div className="mt-1 font-serif text-lg text-gold-500">
              {pct(project.expectedReturn)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted-dark">
              Min. ticket
            </div>
            <div className="mt-1 font-serif text-lg text-navy-900">
              {money(project.minInvestment)}
            </div>
          </div>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[2px] text-navy-800 transition-colors hover:text-gold-500"
        >
          View opportunity
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
