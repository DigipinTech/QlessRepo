import "server-only";
import { prisma } from "@/lib/prisma";

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export interface AnalyticsResult {
  range: { from: string; to: string; days: number };
  totalPatients: number;
  avgWaitMinutes: number;
  noShowRatePct: number;
  completedCount: number;
  dailyTrend: Array<{ date: string; total: number; completed: number; noShow: number; cancelled: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  doctorEfficiency: Array<{
    doctorId: string;
    doctorName: string;
    completedCount: number;
    noShowCount: number;
    totalCount: number;
    avgConsultMinutes: number;
    noShowRatePct: number;
  }>;
}

export async function computeAnalytics(hospitalId: string, days: number): Promise<AnalyticsResult> {
  const from = dateNDaysAgo(days - 1);
  const to = dateNDaysAgo(0);

  const tokens = await prisma.token.findMany({
    where: { hospitalId, queueDate: { gte: from, lte: to } },
    include: { doctor: { select: { id: true, name: true } } },
  });

  const dailyMap = new Map<string, { total: number; completed: number; noShow: number; cancelled: number }>();
  const hourCounts = new Array(24).fill(0);
  const waitDurations: number[] = [];
  const doctorMap = new Map<
    string,
    { doctorName: string; completed: number; noShow: number; total: number; consultDurations: number[] }
  >();

  for (const t of tokens) {
    const day = dailyMap.get(t.queueDate) ?? { total: 0, completed: 0, noShow: 0, cancelled: 0 };
    day.total += 1;
    if (t.status === "COMPLETED") day.completed += 1;
    if (t.status === "NO_SHOW") day.noShow += 1;
    if (t.status === "CANCELLED") day.cancelled += 1;
    dailyMap.set(t.queueDate, day);

    hourCounts[t.createdAt.getUTCHours()] += 1;

    if (t.calledAt) {
      waitDurations.push((t.calledAt.getTime() - t.createdAt.getTime()) / 60000);
    }

    const doc = doctorMap.get(t.doctorId) ?? {
      doctorName: t.doctor.name,
      completed: 0,
      noShow: 0,
      total: 0,
      consultDurations: [],
    };
    doc.total += 1;
    if (t.status === "COMPLETED") {
      doc.completed += 1;
      if (t.consultationStartAt && t.completedAt) {
        doc.consultDurations.push((t.completedAt.getTime() - t.consultationStartAt.getTime()) / 60000);
      }
    }
    if (t.status === "NO_SHOW") doc.noShow += 1;
    doctorMap.set(t.doctorId, doc);
  }

  const dailyTrend = Array.from({ length: days }, (_, i) => {
    const date = dateNDaysAgo(days - 1 - i);
    const entry = dailyMap.get(date) ?? { total: 0, completed: 0, noShow: 0, cancelled: 0 };
    return { date, ...entry };
  });

  const totalPatients = tokens.length;
  const completedCount = tokens.filter((t) => t.status === "COMPLETED").length;
  const noShowCount = tokens.filter((t) => t.status === "NO_SHOW").length;
  const avgWaitMinutes = waitDurations.length
    ? Math.round((waitDurations.reduce((a, b) => a + b, 0) / waitDurations.length) * 10) / 10
    : 0;
  const noShowRatePct = totalPatients ? Math.round((noShowCount / totalPatients) * 1000) / 10 : 0;

  const peakHours = hourCounts.map((count, hour) => ({ hour, count }));

  const doctorEfficiency = Array.from(doctorMap.entries())
    .map(([doctorId, d]) => ({
      doctorId,
      doctorName: d.doctorName,
      completedCount: d.completed,
      noShowCount: d.noShow,
      totalCount: d.total,
      avgConsultMinutes: d.consultDurations.length
        ? Math.round((d.consultDurations.reduce((a, b) => a + b, 0) / d.consultDurations.length) * 10) / 10
        : 0,
      noShowRatePct: d.total ? Math.round((d.noShow / d.total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.totalCount - a.totalCount);

  return {
    range: { from, to, days },
    totalPatients,
    avgWaitMinutes,
    noShowRatePct,
    completedCount,
    dailyTrend,
    peakHours,
    doctorEfficiency,
  };
}
