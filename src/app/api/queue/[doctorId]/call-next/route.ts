import { NextResponse } from "next/server";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { callNextToken } from "@/lib/queue/engine";

export async function POST(_req: Request, ctx: RouteContext<"/api/queue/[doctorId]/call-next">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession(["DOCTOR", "HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    const doctor = await loadDoctorForSession(doctorId, session);
    const token = await callNextToken(doctor.hospitalId, doctorId);
    return NextResponse.json({ token });
  } catch (err) {
    return handleApiError(err);
  }
}
