import { Mail, MapPin, Phone } from "lucide-react";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue-600">Contact</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-brand-slate-900">
            Let&apos;s put QLess in your OPD
          </h1>
          <p className="mt-4 text-brand-slate-600">
            Tell us about your hospital or clinic and we&apos;ll set up a
            walkthrough tailored to your departments and doctor count.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-brand-blue-600" />
              <div>
                <p className="text-sm font-medium text-brand-slate-900">Email</p>
                <p className="text-sm text-brand-slate-500">hello@qless.app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-brand-blue-600" />
              <div>
                <p className="text-sm font-medium text-brand-slate-900">Phone</p>
                <p className="text-sm text-brand-slate-500">+91 80 4000 1000</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-brand-blue-600" />
              <div>
                <p className="text-sm font-medium text-brand-slate-900">Built by</p>
                <p className="text-sm text-brand-slate-500">DigiPin Technology</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
          <DemoRequestForm />
        </div>
      </div>
    </div>
  );
}
