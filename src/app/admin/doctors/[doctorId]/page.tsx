import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { DoctorEditor } from "@/components/admin/doctor-editor";

export default async function DoctorDetailPage({ params }: PageProps<"/admin/doctors/[doctorId]">) {
  const session = await requireRole("HOSPITAL_ADMIN");
  const { doctorId } = await params;

  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, hospitalId: session.hospitalId! } });
  if (!doctor) notFound();

  const departments = await prisma.department.findMany({
    where: { hospitalId: session.hospitalId! },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/doctors" className="flex items-center gap-1.5 text-sm text-brand-slate-500 hover:text-brand-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to doctors
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">{doctor.name}</h1>
        <p className="mt-1 text-sm text-brand-slate-500">{doctor.specialization}</p>
      </div>
      <DoctorEditor doctor={doctor} departments={departments} />
    </div>
  );
}
