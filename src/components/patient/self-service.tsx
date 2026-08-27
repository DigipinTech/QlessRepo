"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QlessMark } from "@/components/brand/qless-mark";
import { ChevronRight, Loader2 } from "lucide-react";

interface DoctorOption {
  id: string;
  name: string;
  specialization: string;
  isPaused: boolean;
}
interface DepartmentOption {
  id: string;
  name: string;
  doctors: DoctorOption[];
}
interface HospitalInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
  departments: DepartmentOption[];
}

const initialForm = { name: "", mobile: "", age: "", gender: "", visitType: "NEW" as "NEW" | "FOLLOW_UP" };

export function PatientSelfService({ slug }: { slug: string }) {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<"department" | "doctor" | "details">("department");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/hospitals/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Hospital not found.");
        return res.json();
      })
      .then((data) => setHospital(data.hospital))
      .catch((e) => setLoadError(e.message));
  }, [slug]);

  function update<K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorId) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/public/hospitals/${slug}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, ...form, age: Number(form.age) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't generate your token.");
      setSubmitting(false);
      return;
    }
    router.push(`/q/${slug}/token/${data.tokenId}`);
  }

  if (loadError) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>;
  }
  if (!hospital) {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading hospital…
      </div>
    );
  }

  const selectedDept = hospital.departments.find((d) => d.id === departmentId) ?? null;
  const selectedDoctor = selectedDept?.doctors.find((d) => d.id === doctorId) ?? null;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <QlessMark className="h-10 w-10" />
        <h1 className="mt-3 text-xl font-semibold text-brand-slate-900">{hospital.name}</h1>
        <p className="text-sm text-brand-slate-500">{hospital.address}</p>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2 text-xs text-brand-slate-400">
        <Step label="Department" active={step === "department"} done={!!departmentId} />
        <ChevronRight className="h-3 w-3" />
        <Step label="Doctor" active={step === "doctor"} done={!!doctorId} />
        <ChevronRight className="h-3 w-3" />
        <Step label="Your details" active={step === "details"} done={false} />
      </div>

      {step === "department" && (
        <div className="space-y-2">
          {hospital.departments.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDepartmentId(d.id);
                setStep("doctor");
              }}
              className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-left transition hover:border-brand-blue-300 hover:bg-brand-blue-50"
            >
              <div>
                <p className="font-medium text-brand-slate-900">{d.name}</p>
                <p className="text-xs text-brand-slate-400">{d.doctors.length} doctor(s) available</p>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-slate-400" />
            </button>
          ))}
        </div>
      )}

      {step === "doctor" && selectedDept && (
        <div className="space-y-2">
          {selectedDept.doctors.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={d.isPaused}
              onClick={() => {
                setDoctorId(d.id);
                setStep("details");
              }}
              className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-left transition hover:border-brand-blue-300 hover:bg-brand-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div>
                <p className="font-medium text-brand-slate-900">{d.name}</p>
                <p className="text-xs text-brand-slate-400">
                  {d.specialization} {d.isPaused ? "· queue paused" : ""}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-slate-400" />
            </button>
          ))}
          <button type="button" onClick={() => setStep("department")} className="mt-2 text-sm text-brand-slate-500 hover:underline">
            ← Change department
          </button>
        </div>
      )}

      {step === "details" && selectedDoctor && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium text-brand-slate-900">{selectedDoctor.name}</p>
            <p className="text-xs text-brand-slate-400">{selectedDept?.name}</p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Full name *</span>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="qless-input" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Mobile *</span>
              <input required value={form.mobile} onChange={(e) => update("mobile", e.target.value)} className="qless-input" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-slate-700">Age *</span>
              <input required type="number" min={0} value={form.age} onChange={(e) => update("age", e.target.value)} className="qless-input" />
            </label>
          </div>
          <div className="flex gap-3">
            {(["NEW", "FOLLOW_UP"] as const).map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => update("visitType", v)}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  form.visitType === v
                    ? "border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700"
                    : "border-border-subtle text-brand-slate-600"
                }`}
              >
                {v === "NEW" ? "New visit" : "Follow-up"}
              </button>
            ))}
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="brand-gradient-bg w-full rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Getting your token…" : "Get my token"}
          </button>
          <button type="button" onClick={() => setStep("doctor")} className="w-full text-center text-sm text-brand-slate-500 hover:underline">
            ← Change doctor
          </button>
        </form>
      )}
    </div>
  );
}

function Step({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={active ? "font-semibold text-brand-blue-600" : done ? "text-brand-green-600" : "text-brand-slate-400"}>
      {label}
    </span>
  );
}
