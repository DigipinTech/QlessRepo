import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { CreateDoctorForm } from "@/components/admin/create-doctor-form";

export default async function DoctorsPage() {
  const session = await requireRole("HOSPITAL_ADMIN");
  const hospitalId = session.hospitalId!;

  const [doctors, departments, hospital] = await Promise.all([
    prisma.doctor.findMany({ where: { hospitalId }, include: { department: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { hospitalId }, orderBy: { name: "asc" } }),
    prisma.hospital.findUnique({ where: { id: hospitalId } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-slate-900">Doctors</h1>
          <p className="mt-1 text-sm text-brand-slate-500">
            {doctors.length} of {hospital?.doctorLimit} doctors on your {hospital?.subscriptionPlan.toLowerCase()} plan.
          </p>
        </div>
        <CreateDoctorForm hospitalId={hospitalId} departments={departments} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Max tokens/day</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {doctors.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-brand-slate-900">{d.name}</p>
                  <p className="text-xs text-brand-slate-400">{d.specialization}</p>
                </td>
                <td className="px-5 py-3.5 text-brand-slate-600">{d.department.name}</td>
                <td className="px-5 py-3.5 text-brand-slate-600">{d.maxTokensPerDay}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={d.isPaused ? "PAUSED" : d.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/doctors/${d.id}`} className="text-sm font-medium text-brand-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-brand-slate-400">
                  No doctors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
