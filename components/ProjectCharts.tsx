"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Project } from "@/lib/types";

const GOLD = "#c9a35c";
const GOLD_LIGHT = "#ecd7a8";
const NAVY = "#0a1a30";
const NAVY_SOFT = "#16304f";
const MUTED = "#6d7c92";

const tooltipStyle = {
  background: "#0a1a30",
  border: "1px solid rgba(201,163,92,0.4)",
  borderRadius: 10,
  fontSize: 12,
  color: "#f6f4ef",
};
const tick = { fontSize: 11, fill: MUTED };

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

function ChartCard({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card-shadow rounded-2xl bg-white p-5 sm:p-6 ${className}`}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-navy-800">{title}</h3>
      {note && <p className="mt-1 text-[12px] font-light text-muted-dark">{note}</p>}
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

export default function ProjectCharts({ project }: { project: Project }) {
  const data = [...(project.stats || [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s, i, all) => {
      const capital = Number(s.capitalRaised);
      const previous = i > 0 ? Number(all[i - 1].capitalRaised) : 0;
      return {
        label: s.label,
        capital,
        inflow: Math.max(0, capital - previous),
        investors: s.investorsCount,
        return: Number(s.projectedReturn),
      };
    });

  if (!data.length) {
    return (
      <p className="text-sm text-muted-dark">
        Statistics will be published as this mandate progresses.
      </p>
    );
  }

  const target = Number(project.targetAmount);
  const raised = Number(project.raisedAmount);
  const remaining = Math.max(0, target - raised);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const funding = [
    { name: "Raised", value: raised },
    { name: "Remaining", value: remaining },
  ];

  const minTicket = Number(project.minInvestment);
  const annual = Number(project.expectedReturn) / 100;
  const horizon = Math.max(1, Number(project.durationMonths) || 12);
  const step = Math.max(1, Math.round(horizon / 8));
  const ticket: { month: string; value: number }[] = [];
  for (let m = 0; m <= horizon; m += step) {
    ticket.push({ month: `M${m}`, value: Math.round(minTicket * (1 + annual * (m / 12))) });
  }
  if (ticket[ticket.length - 1].month !== `M${horizon}`) {
    ticket.push({ month: `M${horizon}`, value: Math.round(minTicket * (1 + annual * (horizon / 12))) });
  }

  const axisProps = { tick, tickLine: false, axisLine: false, minTickGap: 18 } as const;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
      <ChartCard title="Capital raised over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -8, right: 8 }}>
            <defs>
              <linearGradient id="capitalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#efebe3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={compact} width={52} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => usd(v)} />
            <Area type="monotone" dataKey="capital" name="Capital" stroke={GOLD} fill="url(#capitalFill)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Funding status" note={`${progress}% of the ${usd(target)} target`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={funding}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
            >
              <Cell fill={GOLD} />
              <Cell fill="#e8e2d4" />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => usd(v)} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill={NAVY} style={{ fontSize: 30, fontWeight: 600, fontFamily: "var(--font-cormorant)" }}>
              {progress}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fill={MUTED} style={{ fontSize: 11, letterSpacing: 1.5 }}>
              FUNDED
            </text>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly capital inflow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -8, right: 8 }}>
            <CartesianGrid stroke="#efebe3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={compact} width={52} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(201,163,92,0.08)" }} formatter={(v: number) => usd(v)} />
            <Bar dataKey="inflow" name="Inflow" fill={GOLD} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Investors joining">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -16, right: 8 }}>
            <CartesianGrid stroke="#efebe3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} width={44} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(10,26,48,0.05)" }} />
            <Bar dataKey="investors" name="Investors" fill={NAVY_SOFT} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Projected return trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -8, right: 8 }}>
            <CartesianGrid stroke="#efebe3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `${v}%`} width={44} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
            <Line type="monotone" dataKey="return" name="Projected return" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3, fill: GOLD, stroke: NAVY }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Minimum ticket projection"
        note={`Illustrative value of ${usd(minTicket)} at ${Number(project.expectedReturn).toFixed(1)}% a year. Not a guarantee.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ticket} margin={{ left: -8, right: 8 }}>
            <defs>
              <linearGradient id="ticketFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity={0.7} />
                <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#efebe3" vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={compact} width={52} domain={["auto", "auto"]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => usd(v)} />
            <Area type="monotone" dataKey="value" name="Value" stroke={GOLD} fill="url(#ticketFill)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
