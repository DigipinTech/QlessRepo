import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { StaffManager } from "@/components/admin/staff-manager";

export default async function StaffPage() {
  const session = await requireRole("HOSPITAL_ADMIN");
  const hospitalId = session.hospitalId!;

  const staff = await prisma.user.findMany({
    where: { hospitalId, role: { in: ["HOSPITAL_ADMIN", "RECEPTIONIST"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Staff access</h1>
        <p className="mt-1 text-sm text-brand-slate-500">
          Manage who can sign in as a Hospital Admin or Receptionist.
        </p>
      </div>
      <StaffManager
        hospitalId={hospitalId}
        staff={staff as Array<{ id: string; name: string; email: string; role: "HOSPITAL_ADMIN" | "RECEPTIONIST"; isActive: boolean }>}
        currentUserId={session.sub}
      />
    </div>
  );
}
