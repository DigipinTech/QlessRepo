"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Copy, Check } from "lucide-react";

const DAYS: Array<[string, string]> = [
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
  ["sat", "Sat"],
  ["sun", "Sun"],
];

const DEFAULT_HOURS = "09:00-13:00, 16:00-19:00";

interface Department {
  id: string;
  name: string;
}

function parseSchedule(raw: Record<string, string>) {
  const out: Record<string, string[]> = {};
  for (const [day, value] of Object.entries(raw)) {
    out[day] = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return out;
}

export function CreateDoctorForm({ hospitalId, departments }: { hospitalId: string; departments: Department[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [maxTokensPerDay, setMaxTokensPerDay] = useState(40);
  const [hours, setHours] = useState<Record<string, string>>(
    Object.fromEntries(DAYS.map(([key], i) => [key, i < 6 ? DEFAULT_HOURS : ""]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/hospitals/${hospitalId}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        specialization,
        departmentId,
        email,
        maxTokensPerDay,
        workingHours: parseSchedule(hours),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    setCredentials({ email, password: data.tempPassword });
    setName("");
    setSpecialization("");
    setEmail("");
    setLoading(false);
    router.refresh();
  }

  function close() {
    setOpen(false);
    setCredentials(null);
    setError(null);
  }

  if (departments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle px-4 py-3 text-sm text-brand-slate-500">
        Add a department first, then you can add doctors.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="brand-gradient-bg flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        <Plus className="h-4 w-4" /> Add doctor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-slate-900">
                {credentials ? "Doctor added" : "Add a doctor"}
              </h2>
              <button type="button" onClick={close} className="rounded-md p-1 text-brand-slate-400 hover:text-brand-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {credentials ? (
              <div className="space-y-4">
                <p className="text-sm text-brand-slate-600">
                  Share these one-time login credentials with the doctor.
                </p>
                <div className="space-y-2 rounded-lg bg-surface-muted p-4 text-sm">
                  <p><span className="text-brand-slate-400">Email: </span><span className="font-medium">{credentials.email}</span></p>
                  <p className="flex items-center gap-2">
                    <span className="text-brand-slate-400">Temp password: </span>
                    <span className="font-mono font-medium">{credentials.password}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.password);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="text-brand-blue-600"
                      aria-label="Copy password"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </p>
                </div>
                <button type="button" onClick={close} className="brand-gradient-bg w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Name *</span>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="qless-input" placeholder="Dr. Jane Doe" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Specialization *</span>
                    <input required value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="qless-input" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Department *</span>
                    <select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="qless-input">
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
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Login email *</span>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="qless-input" />
                </label>

                <div className="border-t border-border-subtle pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
                    Working hours (comma-separated slots, e.g. 09:00-13:00, 16:00-19:00)
                  </p>
                  <div className="space-y-2">
                    {DAYS.map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-10 text-xs font-medium text-brand-slate-500">{label}</span>
                        <input
                          value={hours[key]}
                          onChange={(e) => setHours((h) => ({ ...h, [key]: e.target.value }))}
                          placeholder="Off"
                          className="qless-input flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={loading} className="brand-gradient-bg w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {loading ? "Adding…" : "Add doctor"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
