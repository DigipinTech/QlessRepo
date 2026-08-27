"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { QlessMark } from "@/components/brand/qless-mark";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/solutions", label: "Solutions" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <QlessMark className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight text-brand-slate-900">QLess</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-brand-blue-600"
                  : "text-brand-slate-600 hover:text-brand-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-brand-slate-700 transition hover:bg-surface-muted"
          >
            Staff sign in
          </Link>
          <Link
            href="/contact"
            className="brand-gradient-bg rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Request a demo
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded-md p-2 text-brand-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border-subtle bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-slate-700 hover:bg-surface-muted"
            >
              Staff sign in
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="brand-gradient-bg mt-1 rounded-lg px-3.5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Request a demo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
