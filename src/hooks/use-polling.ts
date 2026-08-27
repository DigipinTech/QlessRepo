"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Polls `url` every `intervalMs` (default 5s, per BRD 7.5's real-time
 * display requirement) and exposes the latest JSON payload. */
export function usePolling<T>(url: string | null, intervalMs = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const json = (await res.json()) as T;
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await fetchOnce();
      if (!cancelled) timerRef.current = setTimeout(tick, intervalMs);
    };
    tick();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url, intervalMs, fetchOnce]);

  return { data, error, loading, refresh: fetchOnce };
}
