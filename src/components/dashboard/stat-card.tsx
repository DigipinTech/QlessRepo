import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  accent?: "blue" | "green" | "slate";
}

export function StatCard({ label, value, icon: Icon, hint, accent = "blue" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-brand-slate-500">{label}</p>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              accent === "blue" && "bg-brand-blue-50 text-brand-blue-600",
              accent === "green" && "bg-brand-green-50 text-brand-green-600",
              accent === "slate" && "bg-brand-slate-100 text-brand-slate-500"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-brand-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-brand-slate-400">{hint}</p>}
    </div>
  );
}
