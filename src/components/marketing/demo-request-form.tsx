"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const initialState = {
  organization: "",
  contactName: "",
  email: "",
  phone: "",
  role: "",
  message: "",
};

export function DemoRequestForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof initialState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm(initialState);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-green-200 bg-brand-green-50 px-6 py-12 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-green-600" />
        <h3 className="text-lg font-semibold text-brand-slate-900">Request received</h3>
        <p className="max-w-sm text-sm text-brand-slate-600">
          Thanks — our team will reach out shortly. In the meantime, feel
          free to explore the staff dashboards with the demo accounts on the
          sign-in page.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-medium text-brand-blue-600 hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hospital / organization" required>
          <input
            required
            value={form.organization}
            onChange={(e) => update("organization", e.target.value)}
            className="qless-input"
            placeholder="Sunrise Multispecialty Hospital"
          />
        </Field>
        <Field label="Your name" required>
          <input
            required
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            className="qless-input"
            placeholder="Anita Rao"
          />
        </Field>
        <Field label="Work email" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="qless-input"
            placeholder="you@hospital.com"
          />
        </Field>
        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="qless-input"
            placeholder="+91 98765 43210"
          />
        </Field>
      </div>
      <Field label="Your role">
        <input
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          className="qless-input"
          placeholder="Hospital Admin, Lab Manager, …"
        />
      </Field>
      <Field label="What would you like to see?">
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={4}
          className="qless-input resize-none"
          placeholder="Tell us about your OPD volume, number of doctors, or specific questions."
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="brand-gradient-bg w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Request a demo"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
