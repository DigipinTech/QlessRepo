"use client";

import { usePolling } from "@/hooks/use-polling";
import { QlessMark } from "@/components/brand/qless-mark";
import { PauseCircle } from "lucide-react";

interface BoardDoctor {
  doctorName: string;
  department: string;
  isPaused: boolean;
  currentToken: string | null;
  nextTokens: string[];
}
interface BoardResponse {
  hospitalName: string;
  board: BoardDoctor[];
  generatedAt: string;
}

export function DisplayBoard({ slug }: { slug: string }) {
  const { data, error } = usePolling<BoardResponse>(`/api/public/hospitals/${slug}/board`);

  if (error) {
    return <p className="p-10 text-center text-lg text-red-400">{error}</p>;
  }
  if (!data) {
    return <p className="p-10 text-center text-lg text-slate-400">Loading live queue…</p>;
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <QlessMark className="h-9 w-9" variant="light" />
            <div>
              <p className="text-2xl font-semibold">{data.hospitalName}</p>
              <p className="text-sm text-white/50">Live queue status</p>
            </div>
          </div>
          <div className="text-right text-sm text-white/40">
            <p>Auto-refreshes every 5s</p>
            <p>{new Date(data.generatedAt).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.board.map((d) => (
            <div key={d.doctorName} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{d.doctorName}</p>
                  <p className="text-sm text-white/50">{d.department}</p>
                </div>
                {d.isPaused && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-300">
                    <PauseCircle className="h-3.5 w-3.5" /> Paused
                  </span>
                )}
              </div>

              <div className="mt-5 rounded-xl bg-gradient-to-br from-brand-blue-600/30 to-brand-green-600/30 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-white/50">Now serving</p>
                <p className="mt-1 text-4xl font-bold">{d.currentToken ?? "—"}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Next up</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {d.nextTokens.length > 0 ? (
                    d.nextTokens.map((t) => (
                      <span key={t} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/30">No one waiting</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {data.board.length === 0 && (
            <p className="col-span-full py-16 text-center text-white/40">No active doctors right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
