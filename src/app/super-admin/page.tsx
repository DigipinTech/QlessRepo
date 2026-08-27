import Link from "next/link";
import { Hospital, Stethoscope, Ticket, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { todayStr } from "@/lib/queue/engine";

export default async function SuperAdminOverviewPage() {
  const [hospitalCount, activeHospitalCount, doctorCount, tokensToday, recentHospitals, recentLeads] =
    await Promise.all([
      prisma.hospital.count(),
      prisma.hospital.count({ where: { status: "ACTIVE" } }),
      prisma.doctor.count(),
      prisma.token.count({ where: { queueDate: todayStr() } }),
      prisma.hospital.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.demoRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Platform overview</h1>
        <p className="mt-1 text-sm text-brand-slate-500">
          System-wide metrics across every hospital running on QLess.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Hospitals onboarded" value={hospitalCount} icon={Hospital} accent="blue" />
        <StatCard label="Active hospitals" value={activeHospitalCount} icon={Hospital} accent="green" />
        <StatCard label="Doctors across platform" value={doctorCount} icon={Stethoscope} accent="blue" />
        <StatCard label="Tokens issued today" value={tokensToday} icon={Ticket} accent="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-slate-900">Recently onboarded hospitals</h2>
            <Link href="/super-admin/hospitals" className="text-sm font-medium text-brand-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border-subtle">
            {recentHospitals.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-brand-slate-900">{h.name}</p>
                  <p className="text-xs text-brand-slate-400">{h.subscriptionPlan} plan · {h.doctorLimit} doctors</p>
                </div>
                <StatusBadge status={h.status} />
              </li>
            ))}
            {recentHospitals.length === 0 && (
              <p className="py-6 text-center text-sm text-brand-slate-400">No hospitals yet.</p>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-slate-900">Latest demo requests</h2>
            <Link
              href="/super-admin/demo-requests"
              className="text-sm font-medium text-brand-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border-subtle">
            {recentLeads.map((l) => (
              <li key={l.id} className="py-3">
                <p className="text-sm font-medium text-brand-slate-900">{l.organization}</p>
                <p className="text-xs text-brand-slate-400">
                  {l.contactName} · {l.email}
                </p>
              </li>
            ))}
            {recentLeads.length === 0 && (
              <p className="py-6 text-center text-sm text-brand-slate-400 flex items-center justify-center gap-2">
                <Inbox className="h-4 w-4" /> No demo requests yet.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
