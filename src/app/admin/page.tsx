import Link from "next/link";
import { Users, Stethoscope, Ticket, Clock, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { todayStr } from "@/lib/queue/engine";

export default async function AdminOverviewPage() {
  const session = await requireRole("HOSPITAL_ADMIN");
  const hospitalId = session.hospitalId!;
  const queueDate = todayStr();

  const [doctorCount, activeDoctors, tokensToday, completedToday, noShowToday, waitingNow, doctors] =
    await Promise.all([
      prisma.doctor.count({ where: { hospitalId } }),
      prisma.doctor.count({ where: { hospitalId, status: "ACTIVE" } }),
      prisma.token.count({ where: { hospitalId, queueDate } }),
      prisma.token.count({ where: { hospitalId, queueDate, status: "COMPLETED" } }),
      prisma.token.count({ where: { hospitalId, queueDate, status: "NO_SHOW" } }),
      prisma.token.count({ where: { hospitalId, queueDate, status: "WAITING" } }),
      prisma.doctor.findMany({
        where: { hospitalId },
        include: {
          department: true,
          tokens: { where: { queueDate }, select: { status: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Today at your hospital</h1>
        <p className="mt-1 text-sm text-brand-slate-500">{new Date().toDateString()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Doctors" value={`${activeDoctors} / ${doctorCount}`} icon={Stethoscope} accent="blue" hint="active / total" />
        <StatCard label="Tokens today" value={tokensToday} icon={Ticket} accent="blue" />
        <StatCard label="Currently waiting" value={waitingNow} icon={Clock} accent="green" />
        <StatCard label="Completed / no-show" value={`${completedToday} / ${noShowToday}`} icon={Users} accent="slate" />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-slate-900">Doctor queues today</h2>
          <Link href="/admin/doctors" className="flex items-center gap-1 text-sm font-medium text-brand-blue-600 hover:underline">
            Manage doctors <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
                <th className="py-2 pr-4">Doctor</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Waiting</th>
                <th className="py-2 pr-4">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {doctors.map((d) => {
                const waiting = d.tokens.filter((t) => t.status === "WAITING").length;
                const completed = d.tokens.filter((t) => t.status === "COMPLETED").length;
                return (
                  <tr key={d.id}>
                    <td className="py-2.5 pr-4 font-medium text-brand-slate-900">{d.name}</td>
                    <td className="py-2.5 pr-4 text-brand-slate-500">{d.department.name}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={d.isPaused ? "PAUSED" : d.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-brand-slate-600">{waiting}</td>
                    <td className="py-2.5 pr-4 text-brand-slate-600">{completed}</td>
                  </tr>
                );
              })}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-slate-400">
                    No doctors yet — add your first doctor to start taking tokens.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
