"use client";

import Image from "next/image";
import Link from "next/link";
import { money, pct, progressOf } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  const progress = progressOf(project.raisedAmount, project.targetAmount);

  return (
    <article className="card-shadow card-shadow-hover group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white">
      <div className="relative h-52 overflow-hidden bg-navy-800">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/15 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-navy-800 shadow-sm">
          {project.sector}
        </span>
        <span className="absolute bottom-4 left-5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.5px] text-gold-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
            <path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" />
            <circle cx="12" cy="9" r="2.3" />
          </svg>
          {project.location}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-[24px] font-semibold leading-snug text-navy-900">
          {project.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[14px] font-light leading-[1.7] text-muted-dark">
          {project.summary || project.description}
        </p>

        <div className="mt-6 rounded-xl bg-ivory p-4">
          <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-[1px] text-muted-dark">
            <span>Capital raised</span>
            <span className="font-semibold text-navy-800">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e8e2d4]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2.5 text-[12.5px] text-muted-dark">
            {money(project.raisedAmount)} of {money(project.targetAmount)}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dark">
              Target return
            </div>
            <div className="mt-1 font-serif text-[22px] font-semibold text-gold-500">
              {pct(project.expectedReturn)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dark">
              Min. ticket
            </div>
            <div className="mt-1 font-serif text-[22px] font-semibold text-navy-900">
              {money(project.minInvestment)}
            </div>
          </div>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="mt-6 flex items-center justify-between border-t border-[#efebe3] pt-4 text-[11px] font-semibold uppercase tracking-[2px] text-navy-800 transition-colors hover:text-gold-500"
        >
          <span>View opportunity</span>
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-gold-300 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-gold-500 group-hover:text-navy-900"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
