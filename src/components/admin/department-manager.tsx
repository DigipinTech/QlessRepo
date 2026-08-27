"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  _count: { doctors: number };
}

export function DepartmentManager({ hospitalId, departments }: { hospitalId: string; departments: Department[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/hospitals/${hospitalId}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    setName("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const res = await fetch(`/api/hospitals/${hospitalId}/departments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't delete this department.");
    }
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">New department</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dermatology"
            required
            className="qless-input w-64"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="brand-gradient-bg flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3">
            <div>
              <p className="font-medium text-brand-slate-900">{d.name}</p>
              <p className="text-xs text-brand-slate-400">{d._count.doctors} doctor(s)</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(d.id)}
              disabled={deletingId === d.id}
              className="rounded-md p-1.5 text-brand-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Delete ${d.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {departments.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-brand-slate-400">
            No departments yet. Add one to start assigning doctors.
          </p>
        )}
      </div>
    </div>
  );
}
