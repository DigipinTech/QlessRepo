import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError } from "@/lib/api-helpers";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/analytics/export">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession();
    resolveHospitalScope(session, hospitalId);

    const url = new URL(req.url);
    const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 7), 1), 90);
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    const fromStr = from.toISOString().slice(0, 10);

    const tokens = await prisma.token.findMany({
      where: { hospitalId, queueDate: { gte: fromStr } },
      include: { doctor: { select: { name: true } }, patient: { select: { name: true, mobile: true, age: true } } },
      orderBy: [{ queueDate: "desc" }, { sequence: "asc" }],
    });

    const header = [
      "Date",
      "Token",
      "Doctor",
      "Patient",
      "Mobile",
      "Age",
      "Visit type",
      "Status",
      "Emergency",
      "Created at",
      "Called at",
      "Completed at",
    ];
    const rows = tokens.map((t) =>
      [
        t.queueDate,
        t.tokenNumber,
        t.doctor.name,
        t.patient.name,
        t.patient.mobile,
        t.patient.age,
        t.visitType,
        t.status,
        t.isEmergency ? "Yes" : "No",
        t.createdAt.toISOString(),
        t.calledAt?.toISOString() ?? "",
        t.completedAt?.toISOString() ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="qless-tokens-${fromStr}.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
