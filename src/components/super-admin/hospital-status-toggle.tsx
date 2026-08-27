"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function HospitalStatusToggle({ hospitalId, status }: { hospitalId: string; status: "ACTIVE" | "INACTIVE" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    const next = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/hospitals/${hospitalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't update status.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="text-xs font-medium text-brand-blue-600 hover:underline disabled:opacity-60"
      >
        {status === "ACTIVE" ? "Disable" : "Enable"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
