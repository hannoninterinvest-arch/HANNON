"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { HannonService, PublishStatus } from "@/lib/types";
import { HOME_SERVICES } from "@/lib/home";

export default function AdminServicesPage() {
  const [services, setServices] = useState<HannonService[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setServices(await api<HannonService[]>("/services/admin/all"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load services");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: { sortOrder?: number; status?: PublishStatus; featured?: boolean }) {
    setError("");
    try {
      await api(`/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const next = [...services];
    [next[index], next[target]] = [next[target], next[index]];
    setServices(next);
    setError("");
    try {
      await api("/services/order", { method: "PUT", body: JSON.stringify({ ids: next.map((s) => s.id) }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save the order");
      await load();
    }
  }

  const featuredCount = services.filter((s) => s.featured).length;

  async function remove(service: HannonService) {
    if (!confirm(`Delete “${service.name}” and its platforms? This action cannot be undone.`)) {
      return;
    }
    setError("");
    try {
      await api(`/services/${service.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed");
    }
  }

  return (
    <DashboardShell title="Services">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-dark">
          Order the services with the arrows. Pick up to {HOME_SERVICES} services for the home page
          ({featuredCount}/{HOME_SERVICES} selected). Without a selection, the first {HOME_SERVICES} are shown.
        </p>
        <Link href="/admin/services/new" className="btn btn-gold">
          New service
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      <div className="grid grid-cols-1 gap-4">
        {services.map((service, index) => (
          <article key={service.id} className="card-shadow rounded-[6px] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-2xl text-navy-900">{service.name}</h2>
                  {service.status && <StatusBadge status={service.status} />}
                  {service.featured && (
                    <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-gold-500">
                      Home page
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-dark">
                  {service.platforms?.length || 0} plateforme
                  {(service.platforms?.length || 0) > 1 ? "s" : ""}
                  {service.description ? ` · ${service.description.slice(0, 140)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="h-8 w-8 rounded-full border border-[#e4dfd4] text-navy-800 hover:border-gold-500 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === services.length - 1}
                  aria-label="Move down"
                  className="h-8 w-8 rounded-full border border-[#e4dfd4] text-navy-800 hover:border-gold-500 disabled:opacity-30"
                >
                  ↓
                </button>
                <span className="ml-1 text-[11px] text-muted-dark">#{index + 1}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href={`/admin/services/${service.id}`}
                className="text-[11px] uppercase tracking-[1.5px] text-navy-800 hover:text-gold-500"
              >
                Edit
              </Link>
              {service.status === "published" && (
                <button
                  onClick={() => patch(service.id, { featured: !service.featured })}
                  className="text-[11px] uppercase tracking-[1.5px] text-[#1f6b3a]"
                >
                  {service.featured ? "Remove from home page" : "Show on home page"}
                </button>
              )}
              <button
                onClick={() =>
                  patch(service.id, {
                    status: service.status === "published" ? "draft" : "published",
                  })
                }
                className="text-[11px] uppercase tracking-[1.5px] text-[#1f6b3a]"
              >
                {service.status === "published" ? "Unpublish" : "Publish"}
              </button>
              {service.status === "published" && (
                <Link
                  href={`/services/${service.slug}`}
                  className="text-[11px] uppercase tracking-[1.5px] text-navy-800 hover:text-gold-500"
                >
                  View page
                </Link>
              )}
              <button
                onClick={() => remove(service)}
                className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a]"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {!services.length && !error && (
          <p className="text-sm text-muted-dark">No services yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
