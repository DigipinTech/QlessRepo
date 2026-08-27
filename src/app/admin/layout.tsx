import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("HOSPITAL_ADMIN");
  const hospital = session.hospitalId
    ? await prisma.hospital.findUnique({ where: { id: session.hospitalId } })
    : null;

  return (
    <AppShell role="HOSPITAL_ADMIN" userName={session.name} hospitalName={hospital?.name}>
      {children}
    </AppShell>
  );
}
