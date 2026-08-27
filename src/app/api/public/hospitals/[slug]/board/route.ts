import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayStr, UPCOMING_TURN_THRESHOLD } from "@/lib/queue/engine";

export async function GET(_req: Request, ctx: RouteContext<"/api/public/hospitals/[slug]/board">) {
  const { slug } = await ctx.params;
  const hospital = await prisma.hospital.findUnique({ where: { slug } });
  if (!hospital || hospital.status !== "ACTIVE") {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }

  const queueDate = todayStr();
  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: hospital.id, status: "ACTIVE" },
    include: {
      department: true,
      tokens: {
        where: { queueDate, status: { in: ["CALLED", "IN_CONSULTATION", "WAITING"] } },
        orderBy: [{ isEmergency: "desc" }, { sequence: "asc" }],
        select: { tokenNumber: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const board = doctors.map((d) => {
    const current = d.tokens.find((t) => t.status === "CALLED" || t.status === "IN_CONSULTATION");
    const waiting = d.tokens.filter((t) => t.status === "WAITING").slice(0, UPCOMING_TURN_THRESHOLD);
    return {
      doctorName: d.name,
      department: d.department.name,
      isPaused: d.isPaused,
      currentToken: current?.tokenNumber ?? null,
      nextTokens: waiting.map((t) => t.tokenNumber),
    };
  });

  return NextResponse.json({ hospitalName: hospital.name, board, generatedAt: new Date().toISOString() });
}
