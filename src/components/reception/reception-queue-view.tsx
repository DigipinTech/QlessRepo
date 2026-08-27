"use client";

import { useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import type { QueueStatusDTO } from "@/lib/queue/types";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { X, RotateCcw } from "lucide-react";

interface DoctorOption {
  id: string;
  name: string;
  department: { name: string };
}

export function ReceptionQueueView({ doctors }: { doctors: DoctorOption[] }) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const { data, error, refresh } = usePolling<QueueStatusDTO>(doctorId ? `/api/queue/${doctorId}/status` : null);
  const [actingId, setActingId] = useState<string | null>(null);

  async function act(tokenId: string, action: "cancel" | "rejoin") {
    setActingId(tokenId);
    await fetch(`/api/tokens/${tokenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActingId(null);
    refresh();
  }

  if (doctors.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle px-4 py-3 text-sm text-brand-slate-500">
        No active doctors configured yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <label className="block max-w-sm">
        <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Doctor</span>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="qless-input">
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.department.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {data && (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Visit</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data.tokens.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-medium text-brand-slate-900">
                    {t.tokenNumber}
                    {t.isEmergency && <span className="ml-2 text-xs font-semibold text-red-600">EMG</span>}
                  </td>
                  <td className="px-5 py-3 text-brand-slate-600">
                    {t.patient.name} · {t.patient.mobile}
                  </td>
                  <td className="px-5 py-3 text-brand-slate-500">{t.visitType === "NEW" ? "New" : "Follow-up"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {t.status === "WAITING" && (
                      <button
                        type="button"
                        onClick={() => act(t.id, "cancel")}
                        disabled={actingId === t.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                    {t.status === "NO_SHOW" && (
                      <button
                        type="button"
                        onClick={() => act(t.id, "rejoin")}
                        disabled={actingId === t.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue-600 hover:underline disabled:opacity-60"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Rejoin queue
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.tokens.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-brand-slate-400">
                    No tokens generated today for this doctor yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
