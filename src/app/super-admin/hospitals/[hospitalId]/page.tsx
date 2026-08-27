import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { HospitalStatusToggle } from "@/components/super-admin/hospital-status-toggle";
import { ArrowLeft } from "lucide-react";

export default async function HospitalDetailPage({
  params,
}: PageProps<"/super-admin/hospitals/[hospitalId]">) {
  const { hospitalId } = await params;
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    include: {
      departments: true,
      doctors: { include: { department: true } },
      _count: { select: { users: true, tokens: true } },
    },
  });
  if (!hospital) notFound();

  return (
    <div className="space-y-6">
      <Link href="/super-admin/hospitals" className="flex items-center gap-1.5 text-sm text-brand-slate-500 hover:text-brand-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to hospitals
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-slate-900">{hospital.name}</h1>
          <p className="mt-1 text-sm text-brand-slate-500">{hospital.address}</p>
          <p className="text-sm text-brand-slate-500">{hospital.phone} · {hospital.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={hospital.status} />
          <HospitalStatusToggle hospitalId={hospital.id} status={hospital.status} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <p className="text-sm text-brand-slate-500">Subscription</p>
          <p className="mt-1 text-lg font-semibold text-brand-slate-900">{hospital.subscriptionPlan}</p>
          <p className="text-xs text-brand-slate-400">Expires {hospital.subscriptionExpiry.toISOString().slice(0, 10)}</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <p className="text-sm text-brand-slate-500">Doctors</p>
          <p className="mt-1 text-lg font-semibold text-brand-slate-900">
            {hospital.doctors.length} / {hospital.doctorLimit}
          </p>
          <p className="text-xs text-brand-slate-400">{hospital.departments.length} departments</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <p className="text-sm text-brand-slate-500">Staff accounts</p>
          <p className="mt-1 text-lg font-semibold text-brand-slate-900">{hospital._count.users}</p>
          <p className="text-xs text-brand-slate-400">{hospital._count.tokens} tokens all-time</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 className="font-semibold text-brand-slate-900">Doctors</h2>
        <ul className="mt-4 divide-y divide-border-subtle">
          {hospital.doctors.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-brand-slate-900">{d.name}</p>
                <p className="text-xs text-brand-slate-400">{d.department.name} · {d.specialization}</p>
              </div>
              <StatusBadge status={d.isPaused ? "PAUSED" : d.status} />
            </li>
          ))}
          {hospital.doctors.length === 0 && (
            <p className="py-6 text-center text-sm text-brand-slate-400">No doctors added yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
