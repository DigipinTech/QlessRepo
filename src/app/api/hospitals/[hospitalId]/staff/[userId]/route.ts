import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/staff/[userId]">) {
  try {
    const { hospitalId, userId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    resolveHospitalScope(session, hospitalId);

    if (userId === session.sub) {
      throw new ApiAuthError("You can't change your own access here.", 400);
    }

    const target = await prisma.user.findFirst({ where: { id: userId, hospitalId } });
    if (!target) throw new ApiAuthError("Staff member not found.", 404);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

    const updated = await prisma.user.update({ where: { id: userId }, data: { isActive: parsed.data.isActive } });

    await logAudit({
      hospitalId,
      userId: session.sub,
      action: parsed.data.isActive ? "STAFF_ENABLED" : "STAFF_DISABLED",
      entityType: "User",
      entityId: userId,
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
