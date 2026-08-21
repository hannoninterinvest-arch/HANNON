"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { AuthUser, UserStatus } from "@/lib/types";

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<AuthUser[]>([]);

  async function load() {
    setInvestors(await api<AuthUser[]>("/users/investors"));
  }

  useEffect(() => {
    load().catch(() => setInvestors([]));
  }, []);

  async function setStatus(id: string, status: UserStatus) {
    await api(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <DashboardShell title="Investors">
      <div className="card-shadow overflow-hidden rounded-[6px] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-[11px] uppercase tracking-[1px] text-muted-dark">
            <tr>
              <th className="px-5 py-3">Investor</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((inv) => (
              <tr key={inv.id} className="border-t border-[#efebe3]">
                <td className="px-5 py-3">
                  <div className="font-medium">
                    {inv.firstName} {inv.lastName}
                  </div>
                  <div className="text-xs text-muted-dark">{inv.email}</div>
                </td>
                <td className="px-5 py-3">{inv.company || "—"}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStatus(inv.id, "approved")}
                      className="text-[11px] uppercase tracking-[1px] text-[#1f6b3a]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setStatus(inv.id, "rejected")}
                      className="text-[11px] uppercase tracking-[1px] text-[#8a2a2a]"
                    >
                      Decline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
