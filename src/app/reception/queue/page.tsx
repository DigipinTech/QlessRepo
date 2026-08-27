import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ReceptionQueueView } from "@/components/reception/reception-queue-view";

export default async function ReceptionQueuePage() {
  const session = await requireRole("RECEPTIONIST");
  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: session.hospitalId!, status: "ACTIVE" },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Today&apos;s queue</h1>
        <p className="mt-1 text-sm text-brand-slate-500">Live status per doctor — updates every 5 seconds.</p>
      </div>
      <ReceptionQueueView doctors={doctors} />
    </div>
  );
}
