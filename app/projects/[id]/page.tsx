"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, money, pct, progressOf } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Project } from "@/lib/types";
import ProjectCharts from "@/components/ProjectCharts";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Project>(`/projects/${params.id}`)
      .then(setProject)
      .catch((e) => setError(e.message));
  }, [params.id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setNotice("");
    setBusy(true);
    try {
      await api("/investments", {
        method: "POST",
        body: JSON.stringify({
          projectId: params.id,
          amount: Number(amount),
          message,
        }),
      });
      setNotice("Your investment request has been sent to HANNON for review.");
      setAmount("");
      setMessage("");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Unable to send request");
    } finally {
      setBusy(false);
    }
  }

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
  const canInvest = user?.role === "investor" && user.status === "approved";

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

          <div className="card-shadow rounded-[6px] bg-navy-900 p-6 text-white">
            <h3 className="font-serif text-2xl">Request an allocation</h3>
            {!user && (
              <p className="mt-3 text-sm text-muted">
                <Link href="/login" className="text-gold-400 underline">
                  Sign in
                </Link>{" "}
                as an approved investor to submit a request.
              </p>
            )}
            {user?.role === "investor" && user.status !== "approved" && (
              <p className="mt-3 text-sm text-gold-400">
                Your account is awaiting administrator approval.
              </p>
            )}
            {user?.role === "admin" && (
              <p className="mt-3 text-sm text-muted">
                Administrators review requests from the admin console.
              </p>
            )}
            {canInvest && (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input
                  required
                  type="number"
                  min={Number(project.minInvestment)}
                  placeholder="Amount (USD)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-[3px] border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
                <textarea
                  rows={3}
                  placeholder="Optional note"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-[3px] border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
                <button disabled={busy} className="btn btn-gold w-full justify-center">
                  {busy ? "Sending…" : "Send investment request"}
                </button>
              </form>
            )}
            {notice && <p className="mt-3 text-sm text-gold-300">{notice}</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
