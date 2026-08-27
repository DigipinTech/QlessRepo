"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { QlessMark } from "@/components/brand/qless-mark";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type StaffRole } from "@/lib/auth/constants";
import { NAV_ITEMS } from "./nav-config";

interface AppShellProps {
  role: StaffRole;
  userName: string;
  hospitalName?: string | null;
  children: React.ReactNode;
}

export function AppShell({ role, userName, hospitalName, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_ITEMS[role];

  const isActive = (href: string) =>
    href === navItems[0]?.href ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <QlessMark className="h-7 w-7" />
        <div>
          <p className="text-base font-semibold leading-tight text-brand-slate-900">QLess</p>
          {hospitalName && <p className="text-xs leading-tight text-brand-slate-400">{hospitalName}</p>}
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              isActive(item.href)
                ? "bg-brand-blue-50 text-brand-blue-700"
                : "text-brand-slate-600 hover:bg-surface-muted hover:text-brand-slate-900"
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border-subtle px-3 py-4">
        <div className="mb-2 px-3">
          <p className="text-sm font-medium text-brand-slate-900">{userName}</p>
          <p className="text-xs text-brand-slate-400">{ROLE_LABEL[role]}</p>
        </div>
        <LogoutButton className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-slate-600 transition hover:bg-surface-muted hover:text-red-600" />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-muted lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border-subtle bg-surface lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3 lg:hidden">
        <Link href={navItems[0]?.href ?? "/"} className="flex items-center gap-2">
          <QlessMark className="h-6 w-6" />
          <span className="font-semibold text-brand-slate-900">QLess</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-brand-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-72 flex-col bg-surface">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-md p-1.5 text-brand-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
