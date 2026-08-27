import { Target, Layers, Rocket } from "lucide-react";

const OBJECTIVES = [
  "Digitize OPD queue management",
  "Reduce physical crowding in waiting areas",
  "Improve patient satisfaction with real-time visibility",
  "Provide measurable wait-time analytics to administrators",
  "Create a SaaS recurring-revenue model for QLess",
  "Build a foundation that other sectors can reuse",
];

const ARCHITECTURE = [
  { name: "Queue Service (Hospital)", note: "This module — token lifecycle and queue engine" },
  { name: "Notification Service", note: "SMS / WhatsApp / push delivery" },
  { name: "Authentication Service", note: "JWT-based login and role management" },
  { name: "Reporting Service", note: "Analytics aggregation and export" },
  { name: "Payment Service", note: "Future — subscription billing" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue-600">About</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-brand-slate-900">
        QLess is a multi-sector queue platform, starting with healthcare
      </h1>
      <p className="mt-4 text-lg text-brand-slate-600">
        Long OPD lines and paper token books are still the norm at most
        hospitals and clinics. QLess digitizes that experience end to end —
        for the hospital running it, the staff working it, and the patient
        standing in it — as a standalone, independently scalable
        microservice inside the wider QLess platform.
      </p>

      <div className="mt-14">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-brand-blue-600" />
          <h2 className="text-2xl font-semibold text-brand-slate-900">Business objectives</h2>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {OBJECTIVES.map((o) => (
            <li
              key={o}
              className="rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-brand-slate-700"
            >
              {o}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14">
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-brand-blue-600" />
          <h2 className="text-2xl font-semibold text-brand-slate-900">How the platform is built</h2>
        </div>
        <p className="mt-3 text-sm text-brand-slate-600">
          QLess is a multi-microservice architecture. Each service owns its
          own database, exposes versioned REST APIs, and deploys and scales
          independently — so the hospital module can grow without waiting on
          the others.
        </p>
        <div className="mt-5 divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
          {ARCHITECTURE.map((s) => (
            <div key={s.name} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <span className="font-medium text-brand-slate-800">{s.name}</span>
              <span className="text-brand-slate-400">{s.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-brand-blue-600" />
          <h2 className="text-2xl font-semibold text-brand-slate-900">Where it&apos;s headed</h2>
        </div>
        <p className="mt-3 text-sm text-brand-slate-600">
          Hospitals &amp; clinics are Phase 1. The same queue engine is
          designed to carry into restaurants (Phase 2), self-care &amp; spa
          (Phase 3), and sports facilities (Phase 4) — plus diagnostic labs
          as a near-term extension of the hospital module itself.
        </p>
      </div>
    </div>
  );
}
