import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { GenerateTokenForm } from "@/components/reception/generate-token-form";

export default async function ReceptionPage() {
  const session = await requireRole("RECEPTIONIST");
  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: session.hospitalId!, status: "ACTIVE" },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Generate a token</h1>
        <p className="mt-1 text-sm text-brand-slate-500">Register a walk-in patient and assign them to a doctor&apos;s queue.</p>
      </div>
      <GenerateTokenForm doctors={doctors} />
    </div>
  );
}
