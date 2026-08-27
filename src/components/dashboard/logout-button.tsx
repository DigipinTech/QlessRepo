"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-slate-600 transition hover:bg-surface-muted hover:text-red-600 disabled:opacity-60"
      }
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
