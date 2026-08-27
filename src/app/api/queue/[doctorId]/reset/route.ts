import { NextResponse } from "next/server";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { resetQueueForDay } from "@/lib/queue/engine";

export async function POST(_req: Request, ctx: RouteContext<"/api/queue/[doctorId]/reset">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    const doctor = await loadDoctorForSession(doctorId, session);
    const result = await resetQueueForDay(doctor.hospitalId, doctorId, session.sub);
    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
