import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError } from "@/lib/api-helpers";

export async function GET(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/notifications">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession();
    resolveHospitalScope(session, hospitalId);

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

    const notifications = await prisma.notificationLog.findMany({
      where: { hospitalId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { token: { select: { tokenNumber: true } } },
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    return handleApiError(err);
  }
}
