"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Copy, Check } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "HOSPITAL_ADMIN" | "RECEPTIONIST";
  isActive: boolean;
}

export function StaffManager({ hospitalId, staff, currentUserId }: { hospitalId: string; staff: StaffUser[]; currentUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"RECEPTIONIST" | "HOSPITAL_ADMIN">("RECEPTIONIST");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/hospitals/${hospitalId}/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    setCredentials({ email, password: data.tempPassword });
    setName("");
    setEmail("");
    setLoading(false);
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    setTogglingId(id);
    await fetch(`/api/hospitals/${hospitalId}/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setTogglingId(null);
    router.refresh();
  }

  function close() {
    setOpen(false);
    setCredentials(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="brand-gradient-bg flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        <Plus className="h-4 w-4" /> Add staff member
      </button>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs font-semibold uppercase tracking-wide text-brand-slate-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-brand-slate-900">{s.name}</p>
                  <p className="text-xs text-brand-slate-400">{s.email}</p>
                </td>
                <td className="px-5 py-3.5 text-brand-slate-600">
                  {s.role === "HOSPITAL_ADMIN" ? "Hospital Admin" : "Receptionist"}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={s.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  {s.id === currentUserId ? (
                    <span className="text-xs text-brand-slate-400">You</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleActive(s.id, s.isActive)}
                      disabled={togglingId === s.id}
                      className="text-sm font-medium text-brand-blue-600 hover:underline disabled:opacity-60"
                    >
                      {s.isActive ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-brand-slate-400">
                  No staff accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-slate-900">
                {credentials ? "Staff account created" : "Add staff member"}
              </h2>
              <button type="button" onClick={close} className="rounded-md p-1 text-brand-slate-400 hover:text-brand-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {credentials ? (
              <div className="space-y-4">
                <p className="text-sm text-brand-slate-600">Share these one-time credentials.</p>
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
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Name *</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="qless-input" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Email *</span>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="qless-input" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Role</span>
                  <select value={role} onChange={(e) => setRole(e.target.value as "RECEPTIONIST" | "HOSPITAL_ADMIN")} className="qless-input">
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                  </select>
                </label>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={loading} className="brand-gradient-bg w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {loading ? "Creating…" : "Create account"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
