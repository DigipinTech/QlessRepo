import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { DepartmentManager } from "@/components/admin/department-manager";

export default async function DepartmentsPage() {
  const session = await requireRole("HOSPITAL_ADMIN");
  const hospitalId = session.hospitalId!;
  const departments = await prisma.department.findMany({
    where: { hospitalId },
    include: { _count: { select: { doctors: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Departments</h1>
        <p className="mt-1 text-sm text-brand-slate-500">Organize doctors into departments before assigning them.</p>
      </div>
      <DepartmentManager hospitalId={hospitalId} departments={departments} />
    </div>
  );
}
