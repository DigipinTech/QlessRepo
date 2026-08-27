"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Copy, Check } from "lucide-react";

const initialState = {
  name: "",
  address: "",
  phone: "",
  email: "",
  subscriptionPlan: "BASIC" as "BASIC" | "PREMIUM",
  doctorLimit: 5,
  subscriptionDays: 365,
  adminName: "",
  adminEmail: "",
};

export function CreateHospitalForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setCredentials({ email: form.adminEmail, password: data.adminTempPassword });
      setForm(initialState);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    setCredentials(null);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="brand-gradient-bg flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        <Plus className="h-4 w-4" /> Onboard hospital
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-slate-900">
                {credentials ? "Hospital created" : "Onboard a new hospital"}
              </h2>
              <button type="button" onClick={close} className="rounded-md p-1 text-brand-slate-400 hover:text-brand-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {credentials ? (
              <div className="space-y-4">
                <p className="text-sm text-brand-slate-600">
                  Share these one-time credentials with the hospital admin. The
                  password won&apos;t be shown again.
                </p>
                <div className="space-y-2 rounded-lg bg-surface-muted p-4 text-sm">
                  <p>
                    <span className="text-brand-slate-400">Email: </span>
                    <span className="font-medium text-brand-slate-900">{credentials.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-brand-slate-400">Temp password: </span>
                    <span className="font-mono font-medium text-brand-slate-900">{credentials.password}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.password);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="text-brand-blue-600 hover:text-brand-blue-700"
                      aria-label="Copy password"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="brand-gradient-bg w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Hospital name" required>
                  <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="qless-input" />
                </Field>
                <Field label="Address" required>
                  <input required value={form.address} onChange={(e) => update("address", e.target.value)} className="qless-input" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" required>
                    <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="qless-input" />
                  </Field>
                  <Field label="Hospital email" required>
                    <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="qless-input" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Plan">
                    <select
                      value={form.subscriptionPlan}
                      onChange={(e) => update("subscriptionPlan", e.target.value as "BASIC" | "PREMIUM")}
                      className="qless-input"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </Field>
                  <Field label="Doctor limit">
                    <input
                      type="number"
                      min={1}
                      value={form.doctorLimit}
                      onChange={(e) => update("doctorLimit", Number(e.target.value))}
                      className="qless-input"
                    />
                  </Field>
                  <Field label="Plan days">
                    <input
                      type="number"
                      min={1}
                      value={form.subscriptionDays}
                      onChange={(e) => update("subscriptionDays", Number(e.target.value))}
                      className="qless-input"
                    />
                  </Field>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
                    First hospital admin
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Admin name" required>
                      <input required value={form.adminName} onChange={(e) => update("adminName", e.target.value)} className="qless-input" />
                    </Field>
                    <Field label="Admin email" required>
                      <input required type="email" value={form.adminEmail} onChange={(e) => update("adminEmail", e.target.value)} className="qless-input" />
                    </Field>
                  </div>
                </div>
                {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="brand-gradient-bg w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create hospital"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">
        {label}
        {required && <span className="text-brand-blue-600"> *</span>}
      </span>
      {children}
    </label>
  );
}
