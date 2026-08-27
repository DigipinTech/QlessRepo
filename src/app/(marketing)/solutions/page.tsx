import Link from "next/link";
import { CheckCircle2, FlaskConical, Hospital, Utensils, Waves, Dumbbell } from "lucide-react";

const HOSPITAL_VALUE = [
  "Doctor-wise queues that run themselves — FIFO by default, with emergency override and manual pause when a doctor needs one.",
  "Reception issues a token in under 15 seconds; patients can also self-register from a QR code.",
  "SMS / WhatsApp / push alerts fire automatically at token creation and again a few tokens before the patient's turn.",
  "A public display board and doctor panel both refresh every 5 seconds, so nobody has to ask the front desk.",
  "Hospital Admins reset queues at day end, cap tokens per doctor, and export daily, weekly and monthly analytics.",
];

const LAB_VALUE = [
  "The same token/queue engine extends naturally to sample collection counters and report pickup windows.",
  "Patients referred from OPD can be routed straight into a lab queue without re-registering.",
  "Wait-time analytics highlight bottlenecks at collection vs. reporting separately.",
];

const FUTURE = [
  { icon: Utensils, title: "Restaurants", body: "Table-wait queues with party-size aware estimates.", phase: "Phase 2" },
  { icon: Waves, title: "Self-care & spa", body: "Service-slot queues for salons and wellness centers.", phase: "Phase 3" },
  { icon: Dumbbell, title: "Sports facilities", body: "Court and slot booking queues for shared facilities.", phase: "Phase 4" },
];

export default function SolutionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue-600">Solutions</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-brand-slate-900">
          One queue engine, built to grow with you
        </h1>
        <p className="mt-4 text-lg text-brand-slate-600">
          QLess is a multi-sector queue management platform. The Hospital &amp;
          Clinic module ships first as a standalone microservice — every
          later sector reuses the same token lifecycle, notification
          pipeline and analytics core.
        </p>
      </div>

      {/* Hospitals */}
      <div className="mt-16 grid gap-10 rounded-2xl border border-border-subtle p-8 lg:grid-cols-[1fr_1.2fr] lg:p-10">
        <div>
          <div className="brand-gradient-bg flex h-11 w-11 items-center justify-center rounded-xl text-white">
            <Hospital className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-brand-slate-900">Hospitals &amp; Clinics</h2>
          <span className="mt-2 inline-block rounded-full bg-brand-green-100 px-2.5 py-1 text-xs font-semibold text-brand-green-700">
            Live now — Phase 1
          </span>
          <p className="mt-4 text-sm leading-relaxed text-brand-slate-600">
            Reduce OPD crowding and give administrators the wait-time data
            they&apos;ve never had. Built for multi-doctor, multi-department
            hospitals as well as single-doctor clinics.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-brand-slate-700 hover:bg-surface-muted"
          >
            Explore the staff dashboard →
          </Link>
        </div>
        <ul className="space-y-3">
          {HOSPITAL_VALUE.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-brand-slate-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Labs */}
      <div className="mt-8 grid gap-10 rounded-2xl border border-border-subtle p-8 lg:grid-cols-[1fr_1.2fr] lg:p-10">
        <div>
          <div className="brand-gradient-bg flex h-11 w-11 items-center justify-center rounded-xl text-white">
            <FlaskConical className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-brand-slate-900">Diagnostic Labs</h2>
          <span className="mt-2 inline-block rounded-full bg-brand-blue-100 px-2.5 py-1 text-xs font-semibold text-brand-blue-700">
            Extension of the Hospital module
          </span>
          <p className="mt-4 text-sm leading-relaxed text-brand-slate-600">
            Labs are not a separate rebuild — they reuse the doctor-wise
            queue engine as a counter-wise queue engine, so a hospital
            running QLess can light up its lab counters with the same
            infrastructure.
          </p>
        </div>
        <ul className="space-y-3">
          {LAB_VALUE.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-brand-slate-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Future phases */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-brand-slate-900">Beyond healthcare</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-slate-600">
          The QLess roadmap carries the same queue engine into other
          high-footfall, wait-sensitive businesses.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {FUTURE.map((f) => (
            <div key={f.title} className="rounded-2xl border border-dashed border-border-subtle p-6">
              <f.icon className="h-6 w-6 text-brand-slate-400" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-slate-400">{f.phase}</p>
              <h3 className="mt-1 font-semibold text-brand-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-brand-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
