import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  WAITING: "Waiting",
  CALLED: "Called",
  IN_CONSULTATION: "In consultation",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  OPEN: "Open",
  PAUSED: "Paused",
  CLOSED: "Closed",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = `status-${status.toLowerCase()}`;
  return (
    <span
      className={cn(
        key,
        "inline-flex items-center rounded-full bg-[var(--status-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--status-fg)]",
        className
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
