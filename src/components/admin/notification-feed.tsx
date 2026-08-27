"use client";

import { useState } from "react";
import { MessageSquare, Smartphone, Bell } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";

interface NotificationEntry {
  id: string;
  channel: "SMS" | "WHATSAPP" | "PUSH";
  event: string;
  message: string;
  status: "SENT" | "FAILED";
  createdAt: string;
  token: { tokenNumber: string } | null;
}

const CHANNEL_META: Record<NotificationEntry["channel"], { icon: typeof MessageSquare; label: string; color: string }> = {
  SMS: { icon: MessageSquare, label: "SMS", color: "text-brand-blue-600 bg-brand-blue-50" },
  WHATSAPP: { icon: Smartphone, label: "WhatsApp", color: "text-brand-green-600 bg-brand-green-50" },
  PUSH: { icon: Bell, label: "Push", color: "text-amber-600 bg-amber-50" },
};

const EVENT_LABEL: Record<string, string> = {
  TOKEN_GENERATED: "Token generated",
  UPCOMING_TURN: "Upcoming turn",
  DOCTOR_CALLING: "Doctor calling",
  DELAY: "Delay notice",
  QUEUE_RESET: "Queue reset",
};

export function NotificationFeed({ hospitalId }: { hospitalId: string }) {
  const [channel, setChannel] = useState<"ALL" | NotificationEntry["channel"]>("ALL");
  const { data, error } = usePolling<{ notifications: NotificationEntry[] }>(
    `/api/hospitals/${hospitalId}/notifications`
  );

  const notifications = (data?.notifications ?? []).filter((n) => channel === "ALL" || n.channel === channel);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "SMS", "WHATSAPP", "PUSH"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              channel === c
                ? "border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700"
                : "border-border-subtle text-brand-slate-500 hover:bg-surface-muted"
            }`}
          >
            {c === "ALL" ? "All channels" : CHANNEL_META[c].label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface">
        {notifications.map((n) => {
          const meta = CHANNEL_META[n.channel];
          const Icon = meta.icon;
          return (
            <div key={n.id} className="flex items-start gap-3 px-5 py-4">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-brand-slate-900">
                    {EVENT_LABEL[n.event] ?? n.event}
                  </p>
                  {n.token && (
                    <span className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-brand-slate-500">
                      {n.token.tokenNumber}
                    </span>
                  )}
                  <span className="text-xs text-brand-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-brand-slate-600">{n.message}</p>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-brand-slate-400">
            No notifications yet — they&apos;ll appear here as tokens move through the queue.
          </p>
        )}
      </div>
    </div>
  );
}
