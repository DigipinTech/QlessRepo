import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, loadDoctorForSession, handleApiError } from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(120).optional(),
  specialization: z.string().min(2).max(150).optional(),
  departmentId: z.string().min(1).optional(),
  maxTokensPerDay: z.coerce.number().int().min(1).max(500).optional(),
  workingHours: z.record(z.string(), z.array(z.string())).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/doctors/[doctorId]">) {
  try {
    const { doctorId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    const doctor = await loadDoctorForSession(doctorId, session);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }

    const { workingHours, ...rest } = parsed.data;
    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        ...rest,
        ...(workingHours ? { workingHours: JSON.stringify(workingHours) } : {}),
      },
    });

    await logAudit({
      hospitalId: doctor.hospitalId,
      userId: session.sub,
      action: "DOCTOR_UPDATED",
      entityType: "Doctor",
      entityId: doctorId,
      details: rest,
    });

    return NextResponse.json({ doctor: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
