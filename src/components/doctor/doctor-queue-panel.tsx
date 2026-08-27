"use client";

import { useState } from "react";
import { PhoneCall, CheckCircle2, UserX, Pause, Play, Clock3, AlertCircle } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";
import type { QueueStatusDTO } from "@/lib/queue/types";
import { StatusBadge } from "@/components/dashboard/status-badge";

export function DoctorQueuePanel({
  doctorId,
  doctorName,
  department,
}: {
  doctorId: string;
  doctorName: string;
  department: string;
}) {
  const { data, error, refresh } = usePolling<QueueStatusDTO>(`/api/queue/${doctorId}/status`);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [delayMsg, setDelayMsg] = useState<string | null>(null);

  async function callNext() {
    setActionLoading("call-next");
    setActionError(null);
    const res = await fetch(`/api/queue/${doctorId}/call-next`, { method: "POST" });
    const body = await res.json();
    if (!res.ok) setActionError(body.error);
    setActionLoading(null);
    refresh();
  }

  async function tokenAction(tokenId: string, action: "start" | "complete" | "no-show") {
    setActionLoading(action);
    setActionError(null);
    const res = await fetch(`/api/tokens/${tokenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = await res.json();
    if (!res.ok) setActionError(body.error);
    setActionLoading(null);
    refresh();
  }

  async function togglePause() {
    if (!data) return;
    setActionLoading("pause");
    await fetch(`/api/queue/${doctorId}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: !data.doctor.isPaused }),
    });
    setActionLoading(null);
    refresh();
  }

  async function sendDelay(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("delay");
    setDelayMsg(null);
    const res = await fetch(`/api/queue/${doctorId}/delay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: delayMinutes }),
    });
    const body = await res.json();
    setDelayMsg(res.ok ? `Notified ${body.notified} waiting patient(s).` : body.error);
    setActionLoading(null);
    refresh();
  }

  if (!data) {
    return error ? (
      <p className="text-sm text-red-600">{error}</p>
    ) : (
      <p className="text-sm text-brand-slate-400">Loading your queue…</p>
    );
  }

  const { doctor, current, upcoming, waitingCount } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-slate-900">{doctorName}</h1>
          <p className="mt-1 text-sm text-brand-slate-500">{department}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={doctor.isPaused ? "PAUSED" : "OPEN"} />
          <button
            type="button"
            onClick={togglePause}
            disabled={actionLoading === "pause"}
            className="flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted disabled:opacity-60"
          >
            {doctor.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {doctor.isPaused ? "Resume queue" : "Pause queue"}
          </button>
        </div>
      </div>

      {actionError && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {actionError}
        </p>
      )}

      {/* Current token */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-slate-400">Now consulting</p>
        {current ? (
          <div className="mt-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-3xl font-bold text-brand-slate-900">{current.tokenNumber}</p>
                <p className="mt-1 text-sm text-brand-slate-600">
                  {current.patient.name} · {current.patient.age}y · {current.patient.mobile}
                </p>
                <p className="text-xs text-brand-slate-400">
                  {current.visitType === "NEW" ? "New visit" : "Follow-up"}
                  {current.isEmergency ? " · Emergency" : ""}
                </p>
              </div>
              <StatusBadge status={current.status} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {current.status === "CALLED" && (
                <>
                  <ActionButton
                    icon={CheckCircle2}
                    label="Start consultation"
                    onClick={() => tokenAction(current.id, "start")}
                    loading={actionLoading === "start"}
                    primary
                  />
                  <ActionButton
                    icon={UserX}
                    label="Mark no-show"
                    onClick={() => tokenAction(current.id, "no-show")}
                    loading={actionLoading === "no-show"}
                  />
                </>
              )}
              {current.status === "IN_CONSULTATION" && (
                <ActionButton
                  icon={CheckCircle2}
                  label="Complete consultation"
                  onClick={() => tokenAction(current.id, "complete")}
                  loading={actionLoading === "complete"}
                  primary
                />
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-start gap-3">
            <p className="text-sm text-brand-slate-500">
              {waitingCount > 0 ? "No one is being seen right now." : "No patients waiting."}
            </p>
            <ActionButton
              icon={PhoneCall}
              label="Call next patient"
              onClick={callNext}
              loading={actionLoading === "call-next"}
              primary
              disabled={waitingCount === 0 || doctor.isPaused}
            />
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-slate-900">Up next</h2>
          <span className="text-sm text-brand-slate-400">{waitingCount} waiting</span>
        </div>
        <ul className="mt-4 space-y-2">
          {upcoming.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium text-brand-slate-900">{t.tokenNumber}</span>
                <span className="ml-2 text-brand-slate-500">{t.patient.name}</span>
                {t.isEmergency && <span className="ml-2 text-xs font-semibold text-red-600">EMERGENCY</span>}
              </div>
              <span className="flex items-center gap-1 text-xs text-brand-slate-400">
                <Clock3 className="h-3.5 w-3.5" /> ~{t.estimatedWaitMinutes} min
              </span>
            </li>
          ))}
          {upcoming.length === 0 && <p className="py-4 text-center text-sm text-brand-slate-400">Queue is empty.</p>}
        </ul>
      </div>

      {/* Delay broadcast */}
      <form onSubmit={sendDelay} className="rounded-2xl border border-border-subtle bg-surface p-6">
        <h2 className="font-semibold text-brand-slate-900">Notify waiting patients of a delay</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Minutes behind</span>
            <input
              type="number"
              min={1}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="qless-input w-32"
            />
          </label>
          <button
            type="submit"
            disabled={actionLoading === "delay"}
            className="rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted disabled:opacity-60"
          >
            Send delay alert
          </button>
        </div>
        {delayMsg && <p className="mt-2 text-sm text-brand-slate-500">{delayMsg}</p>}
      </form>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  primary,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  loading?: boolean;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={
        primary
          ? "brand-gradient-bg flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          : "flex items-center gap-2 rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted disabled:opacity-50"
      }
    >
      <Icon className="h-4 w-4" />
      {loading ? "Please wait…" : label}
    </button>
  );
}
