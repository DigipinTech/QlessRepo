import Link from "next/link";
import {
  Activity,
  Bell,
  ClipboardList,
  Clock,
  FlaskConical,
  Hospital,
  QrCode,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react";
import { QlessMark } from "@/components/brand/qless-mark";

const AUDIENCES = [
  {
    icon: Hospital,
    title: "Hospitals & clinics",
    body: "Run every doctor's queue from one dashboard: onboard doctors, set schedules, cap daily tokens, and reset the queue at day end without spreadsheets.",
  },
  {
    icon: Users,
    title: "Patients",
    body: "Scan a QR code, pick a doctor, and get a token with a live estimated wait. Track your position from your phone and get alerted before your turn.",
  },
  {
    icon: FlaskConical,
    title: "Diagnostic labs",
    body: "The same queue engine that runs OPD lines is built to extend to sample collection and report counters — on the QLess roadmap right after hospitals.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Reception issues a token",
    body: "Walk-in or QR self-registration captures the patient, doctor and visit type in seconds — no paper token books.",
  },
  {
    step: "02",
    title: "The queue runs itself",
    body: "FIFO ordering, emergency overrides, doctor pauses and no-show handling are all automatic and logged.",
  },
  {
    step: "03",
    title: "Everyone sees live status",
    body: "The display board, the doctor panel and the patient's phone all refresh in real time — nobody has to ask 'how many before me?'",
  },
];

const FEATURES = [
  { icon: ClipboardList, title: "Doctor-wise queues", body: "Independent FIFO queues per doctor with configurable daily token limits." },
  { icon: Bell, title: "SMS / WhatsApp / push alerts", body: "Patients are notified when their token is generated and again a few tokens before their turn." },
  { icon: Timer, title: "Live wait estimates", body: "Every token carries an estimated wait time that updates as the queue moves." },
  { icon: Activity, title: "Analytics that matter", body: "Average wait time, peak hours, doctor efficiency and no-show rate — exportable to CSV, Excel or PDF." },
  { icon: QrCode, title: "QR self check-in", body: "Patients can self-register from a hospital QR code and skip the counter entirely." },
  { icon: ShieldCheck, title: "Role-based access", body: "Super Admin, Hospital Admin, Doctor and Receptionist each see exactly what they need — nothing more." },
];

const METRICS = [
  { value: "25%", label: "target reduction in average patient wait time" },
  { value: "< 2s", label: "queue update latency across every screen" },
  { value: "1,000+", label: "tokens/day supported per hospital" },
  { value: "99%", label: "uptime target for the queue service" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_-10%,rgba(30,136,229,0.12),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(46,125,50,0.12),transparent_40%)]"
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-brand-slate-600">
              <QlessMark className="h-3.5 w-3.5" />
              Hospital &amp; Clinic Queue Module — Phase 1
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-brand-slate-900 sm:text-5xl">
              The waiting room, <span className="brand-gradient-text">digitized</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-slate-600">
              QLess replaces the token book and the crowded OPD corridor with
              real-time digital queues — so hospitals run smoother, patients
              wait less, and administrators finally get the data to prove it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="brand-gradient-bg rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Request a demo
              </Link>
              <Link
                href="/display/sunrise-hospital"
                className="rounded-lg border border-border-subtle bg-surface px-5 py-3 text-sm font-semibold text-brand-slate-700 transition hover:bg-surface-muted"
              >
                See a live queue board →
              </Link>
            </div>
            <p className="mt-4 text-xs text-brand-slate-400">
              Staff dashboards use seeded demo data — no real patient information.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xl shadow-brand-blue-900/5">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-slate-400">Now serving</p>
                  <p className="mt-1 text-3xl font-bold text-brand-slate-900">D1-014</p>
                </div>
                <span className="status-in_consultation rounded-full bg-[var(--status-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-fg)]">
                  In consultation
                </span>
              </div>
              <p className="mt-3 text-sm text-brand-slate-500">Dr. Meera Nair · Cardiology</p>
              <div className="mt-5 space-y-2">
                {["D1-015", "D1-016", "D1-017"].map((t, i) => (
                  <div
                    key={t}
                    className="flex items-center justify-between rounded-lg bg-surface-muted px-3.5 py-2.5 text-sm"
                  >
                    <span className="font-medium text-brand-slate-700">{t}</span>
                    <span className="text-brand-slate-400">
                      {i === 0 ? "Next" : `~${(i + 1) * 8} min wait`}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-5 flex items-center gap-1.5 text-xs text-brand-slate-400">
                <Clock className="h-3.5 w-3.5" /> auto-refreshes every 5 seconds
              </p>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-brand-green-100 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-full bg-brand-blue-100 blur-2xl"
            />
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-border-subtle bg-surface-muted">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center lg:text-left">
              <p className="brand-gradient-text text-3xl font-bold">{m.value}</p>
              <p className="mt-1 text-sm text-brand-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-slate-900">
            Built for everyone standing in the line
          </h2>
          <p className="mt-3 text-brand-slate-600">
            QLess starts with hospitals and clinics, and the same queue
            engine is designed to extend to diagnostic labs, restaurants,
            spas and sports facilities in later phases.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="rounded-2xl border border-border-subtle bg-surface p-6">
              <div className="brand-gradient-bg flex h-11 w-11 items-center justify-center rounded-xl text-white">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-brand-slate-900">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-slate-600">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-slate-900">How QLess works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step}>
                <span className="brand-gradient-text text-4xl font-bold">{s.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-brand-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-slate-900">Everything the MVP needs</h2>
          <Link href="/features" className="hidden text-sm font-medium text-brand-blue-600 hover:underline sm:block">
            View all features →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border-subtle p-6">
              <f.icon className="h-6 w-6 text-brand-blue-600" />
              <h3 className="mt-4 font-semibold text-brand-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="brand-gradient-bg flex flex-col items-start justify-between gap-6 rounded-2xl p-10 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold">See QLess running on a real hospital dataset</h2>
            <p className="mt-2 max-w-lg text-white/85">
              Sign in with a demo account to explore the Super Admin, Hospital
              Admin, Doctor and Receptionist experiences — or watch the
              public display board update live.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-blue-700 transition hover:bg-white/90"
            >
              Staff sign in
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
