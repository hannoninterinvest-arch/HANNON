"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { api, money } from "@/lib/api";
import type { AuthUser, HannonService, InvestmentRequest, InvestorInquiry, Project } from "@/lib/types";

export default function AdminHomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [investors, setInvestors] = useState<AuthUser[]>([]);
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [services, setServices] = useState<HannonService[]>([]);
  const [inquiries, setInquiries] = useState<InvestorInquiry[]>([]);

  useEffect(() => {
    api<Project[]>("/projects/admin/all").then(setProjects).catch(() => []);
    api<AuthUser[]>("/users/investors").then(setInvestors).catch(() => []);
    api<InvestmentRequest[]>("/investments").then(setRequests).catch(() => []);
    api<HannonService[]>("/services/admin/all").then(setServices).catch(() => []);
    api<InvestorInquiry[]>("/inquiries").then(setInquiries).catch(() => []);
  }, []);

  const pendingInvestors = investors.filter((i) => i.status === "pending").length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const newInquiries = inquiries.filter((item) => item.status === "nouveau").length;

  return (
    <DashboardShell title="Administration">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          ["Projects", projects.length, "/admin/projects"],
          ["Services", services.length, "/admin/services"],
          ["Propositions et questions", newInquiries, "/admin/inquiries"],
          ["Investors", investors.length, "/admin/investors"],
          ["Pending investors", pendingInvestors, "/admin/investors"],
          ["Pending requests", pendingRequests, "/admin/requests"],
        ].map(([label, value, href]) => (
          <Link
            key={label as string}
            href={href as string}
            className="card-shadow card-shadow-hover rounded-[6px] bg-white p-5"
          >
            <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
              {label}
            </div>
            <div className="mt-2 font-serif text-3xl text-navy-900">{value}</div>
          </Link>
        ))}
      </div>
      <div className="card-shadow mt-8 rounded-[6px] bg-white p-5">
        <h2 className="text-[12px] font-semibold uppercase tracking-[1.5px]">
          Capital across live projects
        </h2>
        <p className="mt-3 font-serif text-3xl text-gold-500">
          {money(projects.reduce((sum, p) => sum + Number(p.raisedAmount), 0))}
        </p>
        <p className="mt-1 text-sm text-muted-dark">
          Raised against{" "}
          {money(projects.reduce((sum, p) => sum + Number(p.targetAmount), 0))}{" "}
          in targets.
        </p>
      </div>
    </DashboardShell>
  );
}
