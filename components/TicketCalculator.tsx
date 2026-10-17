"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { money } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function TicketCalculator({ project }: { project: Project }) {
  const min = Math.max(1, Number(project.minInvestment) || 1);
  const target = Number(project.targetAmount) || 0;
  const rawMax = Number(project.maxInvestment);
  const max = rawMax > min ? rawMax : Math.max(min * 20, min + 1);
  const step = Math.max(1, Number(project.ticketStep) || Math.max(1, Math.round(min / 10)));
  const annual = Number(project.expectedReturn) / 100;
  const months = Math.max(1, Number(project.durationMonths) || 12);

  const [amount, setAmount] = useState(min);

  const result = useMemo(() => {
    const gain = amount * annual * (months / 12);
    return {
      gain,
      total: amount + gain,
      share: target > 0 ? (amount / target) * 100 : 0,
    };
  }, [amount, annual, months, target]);

  const clamp = (value: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  const query = new URLSearchParams({ type: "interest", project: project.id, budget: String(Math.round(amount)) });

  return (
    <div className="card-shadow rounded-2xl bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-500">
            Ticket calculator
          </h3>
          <p className="mt-1 text-sm font-light text-muted-dark">
            Choose a ticket to see its illustrative return and share of the round.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-[#e8e2d4] bg-ivory px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-dark">USD</span>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={Math.round(amount)}
            onChange={(e) => setAmount(clamp(Number(e.target.value)))}
            className="w-32 bg-transparent text-right font-serif text-xl font-semibold text-navy-900 outline-none"
            aria-label="Ticket amount in USD"
          />
        </label>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-6 w-full accent-[#c9a35c]"
        aria-label="Ticket amount slider"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted-dark">
        <span>{money(min)}</span>
        <span>{money(max)}</span>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Projected gain", money(Math.round(result.gain))],
          ["Projected value", money(Math.round(result.total))],
          ["Share of round", `${result.share < 0.1 && result.share > 0 ? "<0.1" : result.share.toFixed(1)}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#efebe3] bg-ivory px-4 py-4">
            <dt className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dark">{label}</dt>
            <dd className="mt-1 font-serif text-2xl font-semibold text-navy-900">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[12px] font-light leading-relaxed text-muted-dark">
        Simple-interest illustration at {Number(project.expectedReturn).toFixed(1)}% a year over {months} months.
        Projections are not a guarantee of future returns.
      </p>

      <Link href={`/contact?${query.toString()}`} className="btn btn-gold mt-5 w-full sm:w-auto">
        Invest {money(Math.round(amount))}: send interest
      </Link>
    </div>
  );
}
