"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Clock3, UserX, CheckCircle2, Download, Printer } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";
import { StatCard } from "@/components/dashboard/stat-card";

interface AnalyticsResult {
  range: { from: string; to: string; days: number };
  totalPatients: number;
  avgWaitMinutes: number;
  noShowRatePct: number;
  completedCount: number;
  dailyTrend: Array<{ date: string; total: number; completed: number; noShow: number; cancelled: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  doctorEfficiency: Array<{
    doctorId: string;
    doctorName: string;
    completedCount: number;
    noShowCount: number;
    totalCount: number;
    avgConsultMinutes: number;
    noShowRatePct: number;
  }>;
}

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function formatHour(h: number) {
  const period = h < 12 ? "am" : "pm";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${period}`;
}

function formatDate(d: string) {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

export function AnalyticsDashboard({ hospitalId }: { hospitalId: string }) {
  const [days, setDays] = useState(7);
  const { data, error } = usePolling<AnalyticsResult>(
    `/api/hospitals/${hospitalId}/analytics?days=${days}`,
    15000
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                days === r.days
                  ? "border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700"
                  : "border-border-subtle text-brand-slate-600 hover:bg-surface-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="print-hide flex gap-2">
          <a
            href={`/api/hospitals/${hospitalId}/analytics/export?days=${days}`}
            className="flex items-center gap-2 rounded-lg border border-border-subtle px-3.5 py-2 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted"
          >
            <Download className="h-4 w-4" /> Export CSV / Excel
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-border-subtle px-3.5 py-2 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted"
          >
            <Printer className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!data ? (
        <p className="text-sm text-brand-slate-400">Loading analytics…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total patients" value={data.totalPatients} icon={Users} accent="blue" hint={`last ${data.range.days} days`} />
            <StatCard label="Avg wait time" value={`${data.avgWaitMinutes} min`} icon={Clock3} accent="blue" hint="token created → called" />
            <StatCard label="Completed visits" value={data.completedCount} icon={CheckCircle2} accent="green" />
            <StatCard label="No-show rate" value={`${data.noShowRatePct}%`} icon={UserX} accent="slate" />
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="font-semibold text-brand-slate-900">Patient trend</h2>
            <p className="text-sm text-brand-slate-500">Tokens issued vs. completed, per day.</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTrend} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E88E5" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#1E88E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2E7D32" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12, fill: "#8a93a1" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#8a93a1" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip labelFormatter={(l) => `Date: ${formatDate(String(l))}`} />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Tokens issued" stroke="#1E88E5" strokeWidth={2} fill="url(#totalFill)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#2E7D32" strokeWidth={2} fill="url(#completedFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="font-semibold text-brand-slate-900">Peak hours</h2>
            <p className="text-sm text-brand-slate-500">Tokens generated by hour of day (24h).</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.peakHours} margin={{ left: -20, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="hour" tickFormatter={formatHour} interval={2} tick={{ fontSize: 11, fill: "#8a93a1" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#8a93a1" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip labelFormatter={(l) => `Hour: ${formatHour(Number(l))}`} />
                  <Bar dataKey="count" name="Tokens" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="font-semibold text-brand-slate-900">Doctor efficiency</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
                    <th className="py-2 pr-4">Doctor</th>
                    <th className="py-2 pr-4">Tokens</th>
                    <th className="py-2 pr-4">Completed</th>
                    <th className="py-2 pr-4">Avg consult time</th>
                    <th className="py-2 pr-4">No-show rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {data.doctorEfficiency.map((d) => (
                    <tr key={d.doctorId}>
                      <td className="py-2.5 pr-4 font-medium text-brand-slate-900">{d.doctorName}</td>
                      <td className="py-2.5 pr-4 text-brand-slate-600">{d.totalCount}</td>
                      <td className="py-2.5 pr-4 text-brand-slate-600">{d.completedCount}</td>
                      <td className="py-2.5 pr-4 text-brand-slate-600">
                        {d.avgConsultMinutes > 0 ? `${d.avgConsultMinutes} min` : "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-brand-slate-600">{d.noShowRatePct}%</td>
                    </tr>
                  ))}
                  {data.doctorEfficiency.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-brand-slate-400">
                        No tokens in this range yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
