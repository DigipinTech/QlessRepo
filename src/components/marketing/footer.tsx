import Link from "next/link";
import { QlessMark } from "@/components/brand/qless-mark";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/solutions", label: "Solutions" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About QLess" },
      { href: "/contact", label: "Contact sales" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/login", label: "Staff sign in" },
      { href: "/display/sunrise-hospital", label: "Live queue demo" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <QlessMark className="h-7 w-7" />
              <span className="text-lg font-semibold tracking-tight text-brand-slate-900">QLess</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-brand-slate-500">
              Digital queue management for hospitals, clinics and diagnostic
              labs — shorter waits, live visibility, and the analytics to
              prove it.
            </p>
            <p className="mt-3 text-xs text-brand-slate-400">
              A product line by DigiPin Technology.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-brand-slate-900">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-slate-500 transition hover:text-brand-blue-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border-subtle pt-6 text-xs text-brand-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QLess. This is a Phase 1 product demonstration.</p>
          <p>Built for hospitals today — restaurants, spas and sports facilities next.</p>
        </div>
      </div>
    </footer>
  );
}
