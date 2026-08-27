import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { setQueuePaused } from "@/lib/queue/engine";

const schema = z.object({ paused: z.boolean() });

export async function POST(req: Request, ctx: RouteContext<"/api/queue/[doctorId]/pause">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession(["DOCTOR", "HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    const doctor = await loadDoctorForSession(doctorId, session);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const updated = await setQueuePaused(doctor.hospitalId, doctorId, parsed.data.paused);
    return NextResponse.json({ doctor: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
