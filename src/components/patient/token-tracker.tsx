"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";
import { QlessMark } from "@/components/brand/qless-mark";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface PublicToken {
  id: string;
  tokenNumber: string;
  status: "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  visitType: "NEW" | "FOLLOW_UP";
  isEmergency: boolean;
  estimatedWaitMinutes: number;
  patientName: string;
  doctorName: string;
  department: string;
  position: number | null;
}

export function TokenTracker({ slug, tokenId }: { slug: string; tokenId: string }) {
  const { data, error, refresh } = usePolling<{ token: PublicToken }>(`/api/public/tokens/${tokenId}`);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Cancel this token?")) return;
    setCancelling(true);
    setCancelError(null);
    const res = await fetch(`/api/public/tokens/${tokenId}/cancel`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCancelError(body.error ?? "Couldn't cancel this token.");
    }
    setCancelling(false);
    refresh();
  }

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!data) {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your token…
      </div>
    );
  }

  const t = data.token;
  const isDone = t.status === "COMPLETED" || t.status === "CANCELLED" || t.status === "NO_SHOW";

  return (
    <div className="mx-auto max-w-md text-center">
      <QlessMark className="mx-auto h-10 w-10" />
      <p className="mt-3 text-sm text-brand-slate-500">{t.doctorName} · {t.department}</p>

      <div className="mt-6 rounded-2xl border border-border-subtle bg-surface p-8">
        <p className="text-5xl font-bold tracking-tight text-brand-slate-900">{t.tokenNumber}</p>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={t.status} />
        </div>

        {t.status === "WAITING" && t.position && (
          <div className="mt-6 space-y-1">
            <p className="text-3xl font-semibold text-brand-blue-600">{t.position}</p>
            <p className="text-sm text-brand-slate-500">patient(s) ahead of you</p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-brand-slate-500">
              <Clock3 className="h-4 w-4" /> Estimated wait ~{t.estimatedWaitMinutes} min
            </p>
          </div>
        )}

        {t.status === "CALLED" && (
          <p className="mt-6 flex items-center justify-center gap-2 text-brand-blue-600">
            <CheckCircle2 className="h-5 w-5" /> It&apos;s your turn — please proceed to the doctor&apos;s room.
          </p>
        )}

        {t.status === "IN_CONSULTATION" && (
          <p className="mt-6 text-sm text-brand-slate-500">You&apos;re currently with the doctor.</p>
        )}

        {t.status === "COMPLETED" && (
          <p className="mt-6 flex items-center justify-center gap-2 text-brand-green-600">
            <CheckCircle2 className="h-5 w-5" /> Your consultation is complete.
          </p>
        )}

        {(t.status === "CANCELLED" || t.status === "NO_SHOW") && (
          <p className="mt-6 flex items-center justify-center gap-2 text-brand-slate-500">
            <XCircle className="h-5 w-5" /> This token is no longer active.
          </p>
        )}

        {t.status === "WAITING" && (
          <button
            type="button"
            onClick={cancel}
            disabled={cancelling}
            className="mt-6 text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Cancel this token
          </button>
        )}
        {cancelError && <p className="mt-2 text-sm text-red-600">{cancelError}</p>}
      </div>

      {isDone && (
        <Link href={`/q/${slug}`} className="mt-6 inline-block text-sm font-medium text-brand-blue-600 hover:underline">
          Get another token
        </Link>
      )}

      {!isDone && <p className="mt-4 text-xs text-brand-slate-400">This page updates automatically every 5 seconds.</p>}
    </div>
  );
}
