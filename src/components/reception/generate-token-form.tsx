"use client";

import { useState } from "react";
import { Ticket, CheckCircle2 } from "lucide-react";

interface DoctorOption {
  id: string;
  name: string;
  department: { name: string };
}

const initial = { name: "", mobile: "", age: "", gender: "", visitType: "NEW" as "NEW" | "FOLLOW_UP", isEmergency: false };

export function GenerateTokenForm({ doctors }: { doctors: DoctorOption[] }) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ tokenNumber: string; estimatedWaitMinutes: number; doctorName: string } | null>(null);

  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/queue/${doctorId}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't generate a token.");
      setLoading(false);
      return;
    }
    const doctorName = doctors.find((d) => d.id === doctorId)?.name ?? "";
    setResult({ tokenNumber: data.token.tokenNumber, estimatedWaitMinutes: data.token.estimatedWaitMinutes, doctorName });
    setForm(initial);
    setLoading(false);
  }

  if (doctors.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle px-4 py-3 text-sm text-brand-slate-500">
        No active doctors are configured yet. Ask your admin to add one.
      </p>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-green-200 bg-brand-green-50 px-6 py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-green-600" />
        <p className="text-3xl font-bold text-brand-slate-900">{result.tokenNumber}</p>
        <p className="text-sm text-brand-slate-600">
          {result.doctorName} · estimated wait ~{result.estimatedWaitMinutes} min
        </p>
        <p className="text-xs text-brand-slate-400">A confirmation SMS has been sent to the patient.</p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="brand-gradient-bg mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
        >
          Generate another token
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Doctor *</span>
        <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="qless-input">
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.department.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Patient name *</span>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="qless-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Mobile number *</span>
          <input required value={form.mobile} onChange={(e) => update("mobile", e.target.value)} className="qless-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Age *</span>
          <input required type="number" min={0} value={form.age} onChange={(e) => update("age", e.target.value)} className="qless-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Gender</span>
          <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className="qless-input">
            <option value="">Prefer not to say</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Visit type</span>
        <div className="flex gap-3">
          {(["NEW", "FOLLOW_UP"] as const).map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => update("visitType", v)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                form.visitType === v
                  ? "border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700"
                  : "border-border-subtle text-brand-slate-600 hover:bg-surface-muted"
              }`}
            >
              {v === "NEW" ? "New visit" : "Follow-up"}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-slate-700">
        <input
          type="checkbox"
          checked={form.isEmergency}
          onChange={(e) => update("isEmergency", e.target.checked)}
          className="h-4 w-4 rounded border-border-subtle text-brand-blue-600"
        />
        Mark as emergency (jumps to the front of the queue)
      </label>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="brand-gradient-bg flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        <Ticket className="h-4 w-4" /> {loading ? "Generating…" : "Generate token"}
      </button>
    </form>
  );
}
