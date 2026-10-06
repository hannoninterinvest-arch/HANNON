"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { InquiryStatus, InquiryType, InvestorInquiry } from "@/lib/types";

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<InvestorInquiry[]>([]);
  const [type, setType] = useState<"" | InquiryType>("");
  const [status, setStatus] = useState<"" | InquiryStatus>("");
  const [error, setError] = useState("");

  async function load(nextType = type, nextStatus = status) {
    const params = new URLSearchParams();
    if (nextType) params.set("type", nextType);
    if (nextStatus) params.set("status", nextStatus);
    const query = params.toString();
    setItems(await api<InvestorInquiry[]>(`/inquiries${query ? `?${query}` : ""}`));
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Impossible de charger les demandes"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyFilters(nextType: "" | InquiryType, nextStatus: "" | InquiryStatus) {
    setType(nextType);
    setStatus(nextStatus);
    setError("");
    try {
      await load(nextType, nextStatus);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Filtre impossible");
    }
  }

  async function markHandled(id: string) {
    setError("");
    try {
      await api(`/inquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "traité" }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mise à jour impossible");
    }
  }

  async function remove(item: InvestorInquiry) {
    if (!confirm(`Supprimer le message de ${item.email} ? Cette action est définitive.`)) return;
    setError("");
    try {
      await api(`/inquiries/${item.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  return (
    <DashboardShell title="Propositions et questions">
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Type
          <select
            value={type}
            onChange={(e) => applyFilters(e.target.value as "" | InquiryType, status)}
            className="mt-1.5 block rounded-[3px] border border-[#e4dfd4] bg-white px-3 py-2 text-sm normal-case tracking-normal"
          >
            <option value="">Tous</option>
            <option value="proposition">Proposition</option>
            <option value="question">Question</option>
          </select>
        </label>
        <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Statut
          <select
            value={status}
            onChange={(e) => applyFilters(type, e.target.value as "" | InquiryStatus)}
            className="mt-1.5 block rounded-[3px] border border-[#e4dfd4] bg-white px-3 py-2 text-sm normal-case tracking-normal"
          >
            <option value="">Tous</option>
            <option value="nouveau">Nouveau</option>
            <option value="traité">Traité</option>
          </select>
        </label>
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="card-shadow rounded-[6px] bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <a href={`mailto:${item.email}`} className="font-medium text-navy-900">
                {item.email}
              </a>
              <StatusBadge status={item.type} />
              <StatusBadge status={item.status} />
              <span className="text-xs text-muted-dark">
                {new Date(item.receivedAt).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <p className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-navy-800">
              {item.message}
            </p>
            <div className="mt-4 flex gap-4">
              {item.status === "nouveau" && (
                <button
                  onClick={() => markHandled(item.id)}
                  className="text-[11px] uppercase tracking-[1.5px] text-[#1f6b3a]"
                >
                  Marquer comme traitée
                </button>
              )}
              <button
                onClick={() => remove(item)}
                className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a]"
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
        {!items.length && !error && (
          <p className="text-sm text-muted-dark">Aucune demande pour ce filtre.</p>
        )}
      </div>
    </DashboardShell>
  );
}
