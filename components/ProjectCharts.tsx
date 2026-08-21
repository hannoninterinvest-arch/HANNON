"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectStat } from "@/lib/types";

function toChart(stats: ProjectStat[]) {
  return [...stats]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({
      label: s.label,
      capital: Number(s.capitalRaised),
      investors: s.investorsCount,
      return: Number(s.projectedReturn),
    }));
}

const tooltipStyle = {
  background: "#0a1a30",
  border: "1px solid rgba(201,163,92,0.4)",
  fontSize: 12,
  color: "#f6f4ef",
};

export default function ProjectCharts({ stats }: { stats: ProjectStat[] }) {
  const data = toChart(stats || []);
  if (!data.length) {
    return (
      <p className="text-sm text-muted-dark">
        Statistics will be published as this mandate progresses.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card-shadow rounded-[6px] bg-white p-5">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[2px] text-navy-800">
          Capital raised
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="capitalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a35c" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#c9a35c" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#efebe3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6d7c92" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#6d7c92" }}
                tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}M`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="capital"
                stroke="#c9a35c"
                fill="url(#capitalFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-shadow rounded-[6px] bg-white p-5">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[2px] text-navy-800">
          Investors & projected return
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#efebe3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6d7c92" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6d7c92" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#6d7c92" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="investors"
                stroke="#0a1a30"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="return"
                stroke="#c9a35c"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
