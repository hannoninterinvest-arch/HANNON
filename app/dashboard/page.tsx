"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { api, money } from "@/lib/api";
import type { InvestmentRequest } from "@/lib/types";

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);

  useEffect(() => {
    api<InvestmentRequest[]>("/investments/me")
      .then(setRequests)
      .catch(() => setRequests([]));
  }, []);

  return (
    <DashboardShell title="Investor workspace">
      {user?.status !== "approved" && (
        <div className="card-shadow mb-6 rounded-[6px] border border-gold-500/30 bg-white px-5 py-4 text-sm text-navy-800">
          Your investor account is <StatusBadge status={user?.status || "pending"} />. You
          can browse projects, but investment requests open after HANNON approval.
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="card-shadow rounded-[6px] bg-white p-5">
          <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Requests
          </div>
          <div className="mt-2 font-serif text-3xl">{requests.length}</div>
        </div>
        <div className="card-shadow rounded-[6px] bg-white p-5">
          <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Accepted
          </div>
          <div className="mt-2 font-serif text-3xl">
            {requests.filter((r) => r.status === "accepted").length}
          </div>
        </div>
        <div className="card-shadow rounded-[6px] bg-white p-5">
          <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Allocated capital
          </div>
          <div className="mt-2 font-serif text-3xl">
            {money(
              requests
                .filter((r) => r.status === "accepted")
                .reduce((sum, r) => sum + Number(r.amount), 0),
            )}
          </div>
        </div>
      </div>

      <div className="card-shadow mt-8 overflow-hidden rounded-[6px] bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[1.5px]">
            My investment requests
          </h2>
          <Link href="/projects" className="text-[11px] uppercase tracking-[1.5px] text-gold-500">
            Browse projects
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-[11px] uppercase tracking-[1px] text-muted-dark">
            <tr>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-[#efebe3]">
                <td className="px-5 py-3">
                  <Link href={`/projects/${req.project.id}`} className="hover:text-gold-500">
                    {req.project.title}
                  </Link>
                </td>
                <td className="px-5 py-3">{money(req.amount)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={req.status} />
                </td>
              </tr>
            ))}
            {!requests.length && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-muted-dark">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
