import { NextResponse } from "next/server";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { getQueueStatus } from "@/lib/queue/engine";

export async function GET(_req: Request, ctx: RouteContext<"/api/queue/[doctorId]/status">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession();
    const doctor = await loadDoctorForSession(doctorId, session);
    const status = await getQueueStatus(doctor.hospitalId, doctorId);
    return NextResponse.json(status);
  } catch (err) {
    return handleApiError(err);
  }
}
