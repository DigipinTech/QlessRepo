"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface DoctorEditorProps {
  doctor: {
    id: string;
    hospitalId: string;
    name: string;
    specialization: string;
    departmentId: string;
    maxTokensPerDay: number;
    status: "ACTIVE" | "INACTIVE";
    isPaused: boolean;
    workingHours: string;
  };
  departments: Department[];
}

export function DoctorEditor({ doctor, departments }: DoctorEditorProps) {
  const router = useRouter();
  const [specialization, setSpecialization] = useState(doctor.specialization);
  const [departmentId, setDepartmentId] = useState(doctor.departmentId);
  const [maxTokensPerDay, setMaxTokensPerDay] = useState(doctor.maxTokensPerDay);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/doctors/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specialization, departmentId, maxTokensPerDay }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save changes.");
    }
    setSaving(false);
    router.refresh();
  }

  async function toggleStatus() {
    setSaving(true);
    await fetch(`/api/doctors/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: doctor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    setSaving(false);
    router.refresh();
  }

  async function togglePause() {
    setSaving(true);
    await fetch(`/api/queue/${doctor.id}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: !doctor.isPaused }),
    });
    setSaving(false);
    router.refresh();
  }

  async function resetQueue() {
    if (!confirm("Reset today's queue for this doctor? Any waiting or in-progress tokens will be closed.")) return;
    setResetting(true);
    setResetMsg(null);
    const res = await fetch(`/api/queue/${doctor.id}/reset`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setResetMsg(`Queue reset. ${data.closedTokens} pending token(s) closed.`);
    } else {
      setResetMsg(data.error ?? "Couldn't reset the queue.");
    }
    setResetting(false);
    router.refresh();
  }

  let schedule: Record<string, string[]> = {};
  try {
    schedule = JSON.parse(doctor.workingHours);
  } catch {
    schedule = {};
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={saving}
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted disabled:opacity-60"
        >
          {doctor.status === "ACTIVE" ? "Deactivate doctor" : "Activate doctor"}
        </button>
        <button
          type="button"
          onClick={togglePause}
          disabled={saving}
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted disabled:opacity-60"
        >
          {doctor.isPaused ? "Resume queue" : "Pause queue"}
        </button>
        <button
          type="button"
          onClick={resetQueue}
          disabled={resetting}
          className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-60"
        >
          <AlertTriangle className="h-4 w-4" /> Reset today&apos;s queue
        </button>
      </div>
      {resetMsg && <p className="text-sm text-brand-slate-600">{resetMsg}</p>}

      <form onSubmit={saveDetails} className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 className="font-semibold text-brand-slate-900">Doctor details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Specialization</span>
            <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="qless-input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Department</span>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="qless-input">
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Max tokens / day</span>
            <input
              type="number"
              min={1}
              value={maxTokensPerDay}
              onChange={(e) => setMaxTokensPerDay(Number(e.target.value))}
              className="qless-input"
            />
          </label>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="brand-gradient-bg rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 className="font-semibold text-brand-slate-900">Working hours</h2>
        <div className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
          {Object.entries(schedule).map(([day, slots]) => (
            <div key={day} className="flex justify-between rounded-lg bg-surface-muted px-3 py-2">
              <span className="font-medium capitalize text-brand-slate-700">{day}</span>
              <span className="text-brand-slate-500">{slots.length ? slots.join(", ") : "Off"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
