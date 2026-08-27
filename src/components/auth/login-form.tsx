"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "superadmin@qless.app" },
  { role: "Hospital Admin", email: "admin@sunrisehospital.example" },
  { role: "Doctor", email: "meera.nair@sunrisehospital.example" },
  { role: "Receptionist", email: "reception@sunrisehospital.example" },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : data.redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-slate-700">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hospital.com"
            className="w-full rounded-lg border border-border-subtle bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border-subtle bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="brand-gradient-bg w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-border-subtle bg-surface-muted p-3.5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-slate-500">
          Demo accounts (password: Qless@123)
        </p>
        <ul className="space-y-1">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword("Qless@123");
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-brand-slate-600 transition hover:bg-white hover:text-brand-blue-600"
              >
                <span className="font-medium">{acc.role}</span>
                <span className="text-brand-slate-400">{acc.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
