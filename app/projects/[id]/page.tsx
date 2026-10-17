"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, money, pct, progressOf } from "@/lib/api";
import type { Project } from "@/lib/types";
import ProjectCharts from "@/components/ProjectCharts";
import { driveLinks } from "@/lib/drive";

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
      <main className="px-6 py-24 text-center text-muted-dark">{error}</main>
    );
  }
  if (!project) {
    return (
      <main className="px-6 py-24 text-center text-muted-dark">
        Loading project…
      </main>
    );
  }

  const progress = progressOf(project.raisedAmount, project.targetAmount);
  const remaining = Math.max(0, Number(project.targetAmount) - Number(project.raisedAmount));
  const presentation = driveLinks(project.presentationUrl);
  const interestHref = `/contact?type=interest&project=${project.id}`;
  const kpis = [
    ["Target", money(project.targetAmount)],
    ["Raised", money(project.raisedAmount)],
    ["Remaining", money(remaining)],
    ["Expected return", pct(project.expectedReturn)],
    ["Horizon", `${project.durationMonths} months`],
    ["Minimum ticket", money(project.minInvestment)],
  ];

  return (
    <main className="bg-ivory pb-20">
      <div className="relative h-[300px] w-full overflow-hidden bg-navy-900 sm:h-[400px]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/25 sm:bg-gradient-to-r sm:via-navy-900/75 sm:to-navy-900/20" />
        <div className="section-pad relative z-[1] mx-auto flex h-full max-w-wrap flex-col justify-end pb-10">
          <Link
            href="/projects"
            className="mb-4 text-[11px] font-semibold uppercase tracking-[2px] text-gold-400 transition-colors hover:text-gold-300"
          >
            ← All projects
          </Link>
          <div className="text-[11px] uppercase tracking-[2px] text-gold-400">
            {project.sector} · {project.location}
          </div>
          <h1 className="display mt-2 text-[34px] text-white sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="section-pad mx-auto max-w-wrap">
        <div className="relative z-[2] -mt-8 grid grid-cols-2 gap-3 sm:-mt-10 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map(([label, value]) => (
            <div key={label} className="card-shadow rounded-2xl bg-white px-4 py-4 sm:px-5">
              <div className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dark">
                {label}
              </div>
              <div className="mt-1.5 font-serif text-[22px] font-semibold leading-tight text-navy-900 sm:text-2xl">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="card-shadow rounded-2xl bg-white p-6 sm:p-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-500">
              Mandate overview
            </h2>
            <p className="mt-4 whitespace-pre-line text-[15px] font-light leading-[1.85] text-navy-800">
              {project.description}
            </p>
            {project.highlights?.length ? (
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {project.highlights.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-[#efebe3] bg-ivory px-3 py-3 text-[12.5px] text-navy-800"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card-shadow rounded-2xl bg-white p-6">
              <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
                Funding progress
              </div>
              <div className="mt-2 font-serif text-4xl font-semibold text-navy-900">{progress}%</div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#efebe3]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-dark">
                {money(project.raisedAmount)} raised of {money(project.targetAmount)}
              </p>
            </div>

            <div className="card-shadow rounded-2xl bg-navy-900 p-6 text-white">
              <h3 className="font-serif text-2xl font-semibold">Interested in this project?</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                Tell us your investment budget and how to reach you. You can also attach
                supporting documents. No account is needed.
              </p>
              <Link href={interestHref} className="btn btn-gold mt-5 w-full">
                Express your interest
              </Link>
              {presentation && (
                <a
                  href="#presentation"
                  className="btn btn-outline mt-3 w-full"
                >
                  View presentation
                </a>
              )}
            </div>
          </aside>
        </div>

        {presentation && (
          <section id="presentation" className="mt-10">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl font-semibold text-navy-900">
                Project presentation
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                {presentation.downloadUrl && (
                  <a
                    href={presentation.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold"
                  >
                    Download PDF
                  </a>
                )}
                <a
                  href={presentation.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-navy"
                >
                  Open in Google Drive
                </a>
              </div>
            </div>
            {presentation.previewUrl ? (
              <div className="card-shadow overflow-hidden rounded-2xl bg-white">
                <iframe
                  src={presentation.previewUrl}
                  title={`${project.title} presentation`}
                  loading="lazy"
                  allow="autoplay"
                  className="h-[460px] w-full sm:h-[640px]"
                />
              </div>
            ) : (
              <p className="card-shadow rounded-2xl bg-white p-6 text-sm text-muted-dark">
                This presentation is a Drive folder. Use “Open in Google Drive” to browse it.
              </p>
            )}
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-navy-900">
            Performance statistics
          </h2>
          <ProjectCharts project={project} />
        </section>
      </div>
    </main>
  );
}
