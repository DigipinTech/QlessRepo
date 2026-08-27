import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, loadDoctorForSession, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { startConsultation, completeToken, markNoShow, rejoinQueue, cancelToken } from "@/lib/queue/engine";

const schema = z.object({
  action: z.enum(["start", "complete", "no-show", "rejoin", "cancel"]),
});

const ACTION_MAP = {
  start: startConsultation,
  complete: completeToken,
  "no-show": markNoShow,
  rejoin: rejoinQueue,
  cancel: cancelToken,
} as const;

export async function PATCH(req: Request, ctx: RouteContext<"/api/tokens/[tokenId]">) {
  try {
    const { tokenId } = await ctx.params;
    const session = await requireApiSession([
      "DOCTOR",
      "RECEPTIONIST",
      "HOSPITAL_ADMIN",
      "SUPER_ADMIN",
    ]);

    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) throw new ApiAuthError("Token not found.", 404);
    const doctor = await loadDoctorForSession(token.doctorId, session);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (parsed.data.action === "cancel" && session.role === "DOCTOR") {
      throw new ApiAuthError("Doctors can't cancel tokens — ask reception to cancel it.", 403);
    }
    if (
      (parsed.data.action === "start" || parsed.data.action === "complete") &&
      session.role !== "DOCTOR" &&
      session.role !== "SUPER_ADMIN" &&
      session.role !== "HOSPITAL_ADMIN"
    ) {
      throw new ApiAuthError("Only the attending doctor can do this.", 403);
    }

    const updater = ACTION_MAP[parsed.data.action];
    const updated = await updater({ hospitalId: doctor.hospitalId, tokenId, actorUserId: session.sub });
    return NextResponse.json({ token: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
