"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HomeSlot from "@/components/HomeSlot";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { HannonService, PublishStatus } from "@/lib/types";

export default function AdminServicesPage() {
  const [services, setServices] = useState<HannonService[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setServices(await api<HannonService[]>("/services/admin/all"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les services");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: { sortOrder?: number; status?: PublishStatus }) {
    setError("");
    try {
      await api(`/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mise à jour impossible");
    }
  }

  async function remove(service: HannonService) {
    if (!confirm(`Supprimer « ${service.name} » et ses plateformes ? Cette action est définitive.`)) {
      return;
    }
    setError("");
    try {
      await api(`/services/${service.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  return (
    <DashboardShell title="Services">
      <div className="mb-6 flex justify-end">
        <Link href="/admin/services/new" className="btn btn-gold">
          Nouveau service
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <article key={service.id} className="card-shadow rounded-[6px] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-2xl text-navy-900">{service.name}</h2>
                  {service.status && <StatusBadge status={service.status} />}
                </div>
                <p className="mt-1 text-sm text-muted-dark">
                  {service.platforms?.length || 0} plateforme
                  {(service.platforms?.length || 0) > 1 ? "s" : ""}
                  {service.description ? ` · ${service.description.slice(0, 140)}` : ""}
                </p>
              </div>
              <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
                Ordre
                <input
                  type="number"
                  min={0}
                  defaultValue={service.sortOrder}
                  key={`${service.id}-${service.sortOrder}`}
                  onBlur={(e) => {
                    const sortOrder = Number(e.target.value);
                    if (!Number.isFinite(sortOrder) || sortOrder === service.sortOrder) return;
                    patch(service.id, { sortOrder });
                  }}
                  className="mt-1.5 block w-24 rounded-[3px] border border-[#e4dfd4] px-3 py-2 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
                />
              </label>
            </div>
            <HomeSlot kind="services" id={service.id} value={service.homeSlot} onSaved={load} />
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href={`/admin/services/${service.id}`}
                className="text-[11px] uppercase tracking-[1.5px] text-navy-800 hover:text-gold-500"
              >
                Modifier
              </Link>
              <button
                onClick={() =>
                  patch(service.id, {
                    status: service.status === "published" ? "draft" : "published",
                  })
                }
                className="text-[11px] uppercase tracking-[1.5px] text-[#1f6b3a]"
              >
                {service.status === "published" ? "Dépublier" : "Publier"}
              </button>
              {service.status === "published" && (
                <Link
                  href={`/services/${service.slug}`}
                  className="text-[11px] uppercase tracking-[1.5px] text-navy-800 hover:text-gold-500"
                >
                  Voir la page
                </Link>
              )}
              <button
                onClick={() => remove(service)}
                className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a]"
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
        {!services.length && !error && (
          <p className="text-sm text-muted-dark">Aucun service enregistré.</p>
        )}
      </div>
    </DashboardShell>
  );
}
