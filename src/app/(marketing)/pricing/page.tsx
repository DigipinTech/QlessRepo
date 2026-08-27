import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Basic",
    price: "₹4,999",
    period: "/month per hospital",
    description: "Single-location clinics getting started with digital queues.",
    highlighted: false,
    features: [
      "Up to 5 doctors",
      "Token generation & FIFO queue engine",
      "Public live display board",
      "SMS notifications",
      "Daily summary report",
    ],
  },
  {
    name: "Premium",
    price: "₹14,999",
    period: "/month per hospital",
    description: "Multi-department hospitals that need full analytics and staff roles.",
    highlighted: true,
    features: [
      "Up to 20 doctors",
      "Everything in Basic",
      "SMS + WhatsApp + push notifications",
      "Full analytics dashboard with CSV / Excel / PDF export",
      "Role-based staff accounts (Admin, Doctor, Receptionist)",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "on-premise or cloud",
    description: "Hospital groups that need on-premise deployment or custom integrations.",
    highlighted: false,
    features: [
      "Unlimited doctors & departments",
      "On-premise deployment option",
      "Dedicated database & SLA",
      "EMR / billing / insurance integration (roadmap)",
      "Dedicated onboarding & training",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue-600">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-brand-slate-900">
          Simple, subscription-based pricing
        </h1>
        <p className="mt-4 text-lg text-brand-slate-600">
          Indicative pricing for this demonstration. Every plan runs the same
          queue engine — you&apos;re paying for doctor capacity, notification
          channels and analytics depth.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col rounded-2xl border p-8",
              plan.highlighted
                ? "border-brand-blue-500 bg-surface shadow-xl shadow-brand-blue-900/10"
                : "border-border-subtle bg-surface"
            )}
          >
            {plan.highlighted && (
              <span className="brand-gradient-bg mb-4 w-fit rounded-full px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-semibold text-brand-slate-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-brand-slate-500">{plan.description}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-brand-slate-900">{plan.price}</span>
              <span className="text-sm text-brand-slate-400">{plan.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-brand-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className={cn(
                "mt-8 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition",
                plan.highlighted
                  ? "brand-gradient-bg text-white hover:opacity-95"
                  : "border border-border-subtle text-brand-slate-700 hover:bg-surface-muted"
              )}
            >
              {plan.name === "Enterprise" ? "Talk to sales" : "Request a demo"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
