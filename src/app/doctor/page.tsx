import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { DoctorQueuePanel } from "@/components/doctor/doctor-queue-panel";

export default async function DoctorPage() {
  const session = await requireRole("DOCTOR");
  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.sub },
    include: { department: true },
  });

  if (!doctor) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-sm text-brand-slate-500">
        Your account isn&apos;t linked to a doctor profile yet. Ask your hospital admin to connect it.
      </div>
    );
  }

  return <DoctorQueuePanel doctorId={doctor.id} doctorName={doctor.name} department={doctor.department.name} />;
}
