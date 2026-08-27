import { requireRole } from "@/lib/auth/current-user";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("SUPER_ADMIN");
  return (
    <AppShell role="SUPER_ADMIN" userName={session.name}>
      {children}
    </AppShell>
  );
}
