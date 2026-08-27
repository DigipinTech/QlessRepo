import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: RouteContext<"/api/public/tokens/[tokenId]">) {
  const { tokenId } = await ctx.params;
  const token = await prisma.token.findUnique({
    where: { id: tokenId },
    include: { doctor: { include: { department: true } }, patient: true },
  });
  if (!token) return NextResponse.json({ error: "Token not found." }, { status: 404 });

  let position: number | null = null;
  if (token.status === "WAITING") {
    const active = await prisma.token.findMany({
      where: {
        doctorId: token.doctorId,
        queueDate: token.queueDate,
        status: { in: ["WAITING", "CALLED", "IN_CONSULTATION"] },
      },
      orderBy: [{ isEmergency: "desc" }, { sequence: "asc" }],
      select: { id: true },
    });
    const index = active.findIndex((t) => t.id === token.id);
    position = index >= 0 ? index + 1 : null;
  }

  return NextResponse.json({
    token: {
      id: token.id,
      tokenNumber: token.tokenNumber,
      status: token.status,
      visitType: token.visitType,
      isEmergency: token.isEmergency,
      estimatedWaitMinutes: token.estimatedWaitMinutes,
      queueDate: token.queueDate,
      patientName: token.patient.name,
      doctorName: token.doctor.name,
      department: token.doctor.department.name,
      position,
    },
  });
}
