import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("RECEPTIONIST");
  const hospital = session.hospitalId
    ? await prisma.hospital.findUnique({ where: { id: session.hospitalId } })
    : null;

  return (
    <AppShell role="RECEPTIONIST" userName={session.name} hospitalName={hospital?.name}>
      {children}
    </AppShell>
  );
}
