"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, money, pct, progressOf } from "@/lib/api";
import type { Project } from "@/lib/types";
import ProjectInterestForm from "@/components/ProjectInterestForm";
import ProjectCharts from "@/components/ProjectCharts";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Project>(`/projects/${params.id}`)
      .then(setProject)
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return (
      <main className="px-10 py-20 text-center text-muted-dark">{error}</main>
    );
  }
  if (!project) {
    return (
      <main className="px-10 py-20 text-center text-muted-dark">
        Loading project…
      </main>
    );
  }

  const progress = progressOf(project.raisedAmount, project.targetAmount);

  return (
    <main className="bg-ivory pb-20">
      <div className="relative h-[360px] w-full overflow-hidden bg-navy-900">
        {project.imageUrl && (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/75 to-navy-900/20" />
        <div className="relative z-[1] mx-auto flex h-full max-w-wrap flex-col justify-end px-6 pb-10 lg:px-10">
          <Link
            href="/projects"
            className="mb-4 text-[11px] uppercase tracking-[2px] text-gold-400"
          >
            ← All projects
          </Link>
          <div className="text-[11px] uppercase tracking-[2px] text-gold-400">
            {project.sector} · {project.location}
          </div>
          <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.4fr_0.8fr] lg:px-10">
        <div>
          <div className="card-shadow rounded-[6px] bg-white p-7">
            <h2 className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-500">
              Mandate overview
            </h2>
            <p className="mt-4 text-[15px] font-light leading-relaxed text-navy-800">
              {project.description}
            </p>
            {project.highlights?.length ? (
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {project.highlights.map((item) => (
                  <li
                    key={item}
                    className="rounded-[4px] border border-[#efebe3] bg-ivory px-3 py-3 text-[12.5px] text-navy-800"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-8">
            <h2 className="mb-4 font-serif text-2xl text-navy-900">
              Performance statistics
            </h2>
            <ProjectCharts stats={project.stats || []} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card-shadow rounded-[6px] bg-white p-6">
            <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
              Funding progress
            </div>
            <div className="mt-2 font-serif text-3xl text-navy-900">
              {progress}%
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efebe3]">
              <div
                className="h-full bg-gold-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-dark">Raised</dt>
                <dd>{money(project.raisedAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-dark">Target</dt>
                <dd>{money(project.targetAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-dark">Expected return</dt>
                <dd>{pct(project.expectedReturn)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-dark">Horizon</dt>
                <dd>{project.durationMonths} months</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-dark">Minimum ticket</dt>
                <dd>{money(project.minInvestment)}</dd>
              </div>
            </dl>
          </div>

          <ProjectInterestForm key={project.id} projectId={project.id} />
        </aside>
      </div>
    </main>
  );
}
