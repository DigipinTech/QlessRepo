import {
  Building2,
  UserCog,
  Ticket,
  Repeat,
  MonitorPlay,
  Smartphone,
  BellRing,
  BarChart3,
} from "lucide-react";

const GROUPS = [
  {
    icon: Building2,
    title: "Hospital onboarding",
    items: [
      "Hospital profile with logo, address and contact details",
      "Subscription plan selection (Basic / Premium) with expiry tracking",
      "Department configuration",
    ],
  },
  {
    icon: UserCog,
    title: "Doctor management",
    items: [
      "Add doctors and assign them to a department",
      "Day-wise working-hour schedules with break-time support",
      "Per-doctor daily token limits",
      "Pause a queue or enable emergency override instantly",
    ],
  },
  {
    icon: Ticket,
    title: "Token management",
    items: [
      "Unique, doctor-linked token numbers generated in seconds",
      "Captures patient name, mobile, age and visit type (new / follow-up)",
      "Live estimated wait time on every token",
      "Automatic confirmation notification on generation",
    ],
  },
  {
    icon: Repeat,
    title: "Queue engine",
    items: [
      "FIFO ordering by default, with emergency priority override",
      "Auto-skip a patient who isn't present when called",
      "Rejoin-queue option for no-shows where the hospital allows it",
      "Full state machine: Waiting → Called → In Consultation → Completed / No-show / Cancelled",
      "Day-end queue reset that archives completed tokens",
    ],
  },
  {
    icon: MonitorPlay,
    title: "Real-time queue display",
    items: [
      "Public display board showing the current token and next three",
      "Doctor name and department shown alongside the token",
      "Auto-refreshes every 5 seconds — no manual reload",
    ],
  },
  {
    icon: Smartphone,
    title: "Patient self-service",
    items: [
      "Scan a QR code to self-register without visiting the counter",
      "Choose department and doctor, then see the estimated wait before joining",
      "Track live queue position from a phone",
      "Cancel a token when the hospital allows it",
    ],
  },
  {
    icon: BellRing,
    title: "Notifications",
    items: [
      "Triggered on token generation, 3-tokens-before-turn, doctor calling, and delays",
      "Simulated across SMS, WhatsApp and push channels for this demo",
      "Delivery status logged for every notification",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    items: [
      "Total patients by day, week and month",
      "Average wait time and peak-hour heatmap",
      "Doctor efficiency and no-show rate",
      "Export to CSV, Excel or PDF",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue-600">Features</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-brand-slate-900">
          Everything in the Phase 1 MVP
        </h1>
        <p className="mt-4 text-lg text-brand-slate-600">
          Scoped directly from the Hospital &amp; Clinic Queue Management BRD
          — role-based access control and audit logging run underneath all
          of it.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className="rounded-2xl border border-border-subtle p-6">
            <div className="flex items-center gap-3">
              <div className="brand-gradient-bg flex h-10 w-10 items-center justify-center rounded-lg text-white">
                <g.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-brand-slate-900">{g.title}</h2>
            </div>
            <ul className="mt-4 space-y-2.5">
              {g.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-brand-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
