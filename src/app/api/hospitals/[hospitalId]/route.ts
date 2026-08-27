import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";

export async function GET(_req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession();
    resolveHospitalScope(session, hospitalId);

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        departments: true,
        doctors: { include: { department: true } },
        _count: { select: { users: true, tokens: true } },
      },
    });
    if (!hospital) throw new ApiAuthError("Hospital not found.", 404);
    return NextResponse.json({ hospital });
  } catch (err) {
    return handleApiError(err);
  }
}

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  subscriptionPlan: z.enum(["BASIC", "PREMIUM"]).optional(),
  doctorLimit: z.coerce.number().int().min(1).max(500).optional(),
  subscriptionExpiry: z.coerce.date().optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession(["SUPER_ADMIN"]);
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }

    const hospital = await prisma.hospital.update({ where: { id: hospitalId }, data: parsed.data });

    await logAudit({
      hospitalId,
      userId: session.sub,
      action: "HOSPITAL_UPDATED",
      entityType: "Hospital",
      entityId: hospitalId,
      details: parsed.data,
    });

    return NextResponse.json({ hospital });
  } catch (err) {
    return handleApiError(err);
  }
}
