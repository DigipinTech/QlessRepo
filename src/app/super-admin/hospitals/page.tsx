import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { CreateHospitalForm } from "@/components/super-admin/create-hospital-form";
import { HospitalStatusToggle } from "@/components/super-admin/hospital-status-toggle";

export default async function HospitalsPage() {
  const hospitals = await prisma.hospital.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { doctors: true, departments: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-slate-900">Hospitals</h1>
          <p className="mt-1 text-sm text-brand-slate-500">
            Every hospital account running on QLess, and their subscription status.
          </p>
        </div>
        <CreateHospitalForm />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
              <th className="px-5 py-3">Hospital</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Doctors</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Expires</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {hospitals.map((h) => (
              <tr key={h.id}>
                <td className="px-5 py-3.5">
                  <Link href={`/super-admin/hospitals/${h.id}`} className="font-medium text-brand-slate-900 hover:text-brand-blue-600">
                    {h.name}
                  </Link>
                  <p className="text-xs text-brand-slate-400">{h.email}</p>
                </td>
                <td className="px-5 py-3.5 text-brand-slate-600">{h.subscriptionPlan}</td>
                <td className="px-5 py-3.5 text-brand-slate-600">
                  {h._count.doctors} / {h.doctorLimit}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={h.status} />
                </td>
                <td className="px-5 py-3.5 text-brand-slate-500">
                  {h.subscriptionExpiry.toISOString().slice(0, 10)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <HospitalStatusToggle hospitalId={h.id} status={h.status} />
                </td>
              </tr>
            ))}
            {hospitals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-brand-slate-400">
                  No hospitals onboarded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
