import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { generateToken } from "@/lib/queue/engine";

const schema = z.object({
  name: z.string().min(2).max(120),
  mobile: z.string().min(6).max(20),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.string().max(30).optional(),
  visitType: z.enum(["NEW", "FOLLOW_UP"]),
  isEmergency: z.boolean().optional(),
});

export async function POST(req: Request, ctx: RouteContext<"/api/queue/[doctorId]/token">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession(["RECEPTIONIST", "HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    const doctor = await loadDoctorForSession(doctorId, session);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the patient details and try again." }, { status: 400 });
    }

    const token = await generateToken({
      hospitalId: doctor.hospitalId,
      doctorId,
      visitType: parsed.data.visitType,
      isEmergency: parsed.data.isEmergency,
      patient: {
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        age: parsed.data.age,
        gender: parsed.data.gender,
      },
    });
    return NextResponse.json({ token });
  } catch (err) {
    return handleApiError(err);
  }
}
