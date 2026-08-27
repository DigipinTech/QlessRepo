import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("DOCTOR");
  const hospital = session.hospitalId
    ? await prisma.hospital.findUnique({ where: { id: session.hospitalId } })
    : null;

  return (
    <AppShell role="DOCTOR" userName={session.name} hospitalName={hospital?.name}>
      {children}
    </AppShell>
  );
}
