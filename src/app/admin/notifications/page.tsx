import { requireRole } from "@/lib/auth/current-user";
import { NotificationFeed } from "@/components/admin/notification-feed";

export default async function NotificationsPage() {
  const session = await requireRole("HOSPITAL_ADMIN");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-brand-slate-500">
          Simulated SMS, WhatsApp and push notifications triggered by the queue engine — this demo logs
          every send instead of calling a real gateway.
        </p>
      </div>
      <NotificationFeed hospitalId={session.hospitalId!} />
    </div>
  );
}
