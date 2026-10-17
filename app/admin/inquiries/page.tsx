"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api, money } from "@/lib/api";
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
    load().catch((e) => setError(e instanceof Error ? e.message : "Unable to load requests"));
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
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function remove(item: InvestorInquiry) {
    if (!confirm(`Delete the message from ${item.email}? This action cannot be undone.`)) return;
    setError("");
    try {
      await api(`/inquiries/${item.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  return (
    <DashboardShell title="Inquiries">
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Type
          <select
            value={type}
            onChange={(e) => applyFilters(e.target.value as "" | InquiryType, status)}
            className="mt-1.5 block rounded-[3px] border border-[#e4dfd4] bg-white px-3 py-2 text-sm normal-case tracking-normal"
          >
            <option value="">All</option>
            <option value="interest">Investment interest</option>
            <option value="proposition">Proposal</option>
            <option value="question">Question</option>
          </select>
        </label>
        <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Status
          <select
            value={status}
            onChange={(e) => applyFilters(type, e.target.value as "" | InquiryStatus)}
            className="mt-1.5 block rounded-[3px] border border-[#e4dfd4] bg-white px-3 py-2 text-sm normal-case tracking-normal"
          >
            <option value="">All</option>
            <option value="nouveau">New</option>
            <option value="traité">Handled</option>
          </select>
        </label>
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="card-shadow rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-navy-900">{item.name || item.email}</span>
              <StatusBadge status={item.type} />
              <StatusBadge status={item.status} />
              <span className="text-xs text-muted-dark">
                {new Date(item.receivedAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-muted-dark">Email</dt>
                <dd>
                  <a href={`mailto:${item.email}`} className="break-all text-navy-900 hover:text-gold-500">
                    {item.email}
                  </a>
                </dd>
              </div>
              {item.phone && (
                <div className="flex gap-2">
                  <dt className="text-muted-dark">Phone</dt>
                  <dd>
                    <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="text-navy-900 hover:text-gold-500">
                      {item.phone}
                    </a>
                  </dd>
                </div>
              )}
              {item.company && (
                <div className="flex gap-2">
                  <dt className="text-muted-dark">Company</dt>
                  <dd>{item.company}</dd>
                </div>
              )}
              {item.budget != null && (
                <div className="flex gap-2">
                  <dt className="text-muted-dark">Budget</dt>
                  <dd className="font-semibold text-gold-500">{money(item.budget)}</dd>
                </div>
              )}
              {item.projectTitle && (
                <div className="flex gap-2 sm:col-span-2">
                  <dt className="text-muted-dark">Project</dt>
                  <dd>
                    {item.projectId ? (
                      <Link href={`/projects/${item.projectId}`} className="text-navy-900 hover:text-gold-500">
                        {item.projectTitle}
                      </Link>
                    ) : (
                      item.projectTitle
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-navy-800">
              {item.message}
            </p>
            {item.attachments?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.attachments.map((file) =>
                  file.url ? (
                    <li key={file.url}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-ivory px-3.5 py-1.5 text-[12px] text-navy-900 hover:border-gold-500 hover:text-gold-500"
                      >
                        {file.name}
                        <span className="text-muted-dark">
                          {file.size >= 1048576
                            ? `${(file.size / 1048576).toFixed(1)} MB`
                            : `${Math.max(1, Math.round(file.size / 1024))} KB`}
                        </span>
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
            <div className="mt-4 flex gap-4">
              {item.status === "nouveau" && (
                <button
                  onClick={() => markHandled(item.id)}
                  className="text-[11px] uppercase tracking-[1.5px] text-[#1f6b3a]"
                >
                  Mark as handled
                </button>
              )}
              <button
                onClick={() => remove(item)}
                className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a]"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {!items.length && !error && (
          <p className="text-sm text-muted-dark">No requests match this filter.</p>
        )}
      </div>
    </DashboardShell>
  );
}
