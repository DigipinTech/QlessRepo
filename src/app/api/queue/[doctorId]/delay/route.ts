import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { sendDelayNotification } from "@/lib/queue/engine";

const schema = z.object({ minutes: z.coerce.number().int().min(1).max(180) });

export async function POST(req: Request, ctx: RouteContext<"/api/queue/[doctorId]/delay">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession(["DOCTOR", "HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    const doctor = await loadDoctorForSession(doctorId, session);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid delay in minutes." }, { status: 400 });
    }

    const result = await sendDelayNotification(doctor.hospitalId, doctorId, parsed.data.minutes);
    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
