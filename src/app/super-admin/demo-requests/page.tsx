import { prisma } from "@/lib/prisma";
import { Mail, Phone } from "lucide-react";

export default async function DemoRequestsPage() {
  const requests = await prisma.demoRequest.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-slate-900">Demo requests</h1>
        <p className="mt-1 text-sm text-brand-slate-500">
          Leads captured from the &quot;Request a demo&quot; form on the marketing site.
        </p>
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border-subtle bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-brand-slate-900">{r.organization}</p>
                <p className="text-sm text-brand-slate-500">
                  {r.contactName}
                  {r.role ? ` · ${r.role}` : ""}
                </p>
              </div>
              <p className="text-xs text-brand-slate-400">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-brand-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-slate-400" /> {r.email}
              </span>
              {r.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-brand-slate-400" /> {r.phone}
                </span>
              )}
            </div>
            {r.message && <p className="mt-3 text-sm text-brand-slate-600">{r.message}</p>}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-sm text-brand-slate-400">
            No demo requests yet. They&apos;ll show up here as soon as someone submits the contact form.
          </div>
        )}
      </div>
    </div>
  );
}
