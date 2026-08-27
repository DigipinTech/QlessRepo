import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/auth/password";
import { randomTempPassword } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

const scheduleSchema = z.record(z.string(), z.array(z.string()));

const schema = z.object({
  name: z.string().min(2).max(120),
  specialization: z.string().min(2).max(150),
  departmentId: z.string().min(1),
  maxTokensPerDay: z.coerce.number().int().min(1).max(500),
  workingHours: scheduleSchema,
  email: z.string().email(),
});

export async function POST(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/doctors">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    resolveHospitalScope(session, hospitalId);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the doctor details and try again." }, { status: 400 });
    }
    const data = parsed.data;

    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) throw new ApiAuthError("Hospital not found.", 404);

    const doctorCount = await prisma.doctor.count({ where: { hospitalId } });
    if (doctorCount >= hospital.doctorLimit) {
      throw new ApiAuthError(
        `This hospital's plan allows up to ${hospital.doctorLimit} doctors. Upgrade the plan to add more.`,
        409
      );
    }

    const department = await prisma.department.findFirst({ where: { id: data.departmentId, hospitalId } });
    if (!department) throw new ApiAuthError("Department not found.", 404);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingUser) throw new ApiAuthError("A user with this email already exists.", 409);

    const tempPassword = randomTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const doctor = await prisma.$transaction(async (tx) => {
      const doctorUser = await tx.user.create({
        data: {
          hospitalId,
          role: "DOCTOR",
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
        },
      });
      return tx.doctor.create({
        data: {
          hospitalId,
          departmentId: data.departmentId,
          userId: doctorUser.id,
          name: data.name,
          specialization: data.specialization,
          maxTokensPerDay: data.maxTokensPerDay,
          workingHours: JSON.stringify(data.workingHours),
          status: "ACTIVE",
        },
      });
    });

    await logAudit({
      hospitalId,
      userId: session.sub,
      action: "DOCTOR_CREATED",
      entityType: "Doctor",
      entityId: doctor.id,
      details: { name: doctor.name, departmentId: doctor.departmentId },
    });

    return NextResponse.json({ doctor, tempPassword });
  } catch (err) {
    return handleApiError(err);
  }
}
