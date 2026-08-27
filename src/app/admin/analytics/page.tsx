import { requireRole } from "@/lib/auth/current-user";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await requireRole("HOSPITAL_ADMIN");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-brand-slate-500">
          Wait-time and queue performance metrics for your hospital.
        </p>
      </div>
      <AnalyticsDashboard hospitalId={session.hospitalId!} />
    </div>
  );
}
