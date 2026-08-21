"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api, money } from "@/lib/api";
import type { InvestmentRequest, InvestmentStatus } from "@/lib/types";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);

  async function load() {
    setRequests(await api<InvestmentRequest[]>("/investments"));
  }

  useEffect(() => {
    load().catch(() => setRequests([]));
  }, []);

  async function setStatus(id: string, status: InvestmentStatus) {
    await api(`/investments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <DashboardShell title="Investment requests">
      <div className="card-shadow overflow-hidden rounded-[6px] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-[11px] uppercase tracking-[1px] text-muted-dark">
            <tr>
              <th className="px-5 py-3">Investor</th>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-[#efebe3]">
                <td className="px-5 py-3">
                  {req.investor
                    ? `${req.investor.firstName} ${req.investor.lastName}`
                    : "—"}
                </td>
                <td className="px-5 py-3">{req.project?.title}</td>
                <td className="px-5 py-3">{money(req.amount)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-5 py-3">
                  {req.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStatus(req.id, "accepted")}
                        className="text-[11px] uppercase tracking-[1px] text-[#1f6b3a]"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setStatus(req.id, "rejected")}
                        className="text-[11px] uppercase tracking-[1px] text-[#8a2a2a]"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
