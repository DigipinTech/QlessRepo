import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/auth/password";
import { randomTempPassword } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["RECEPTIONIST", "HOSPITAL_ADMIN"]),
});

export async function POST(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/staff">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    resolveHospitalScope(session, hospitalId);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the staff details and try again." }, { status: 400 });
    }
    const data = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ApiAuthError("A user with this email already exists.", 409);

    const tempPassword = randomTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        hospitalId,
        role: data.role,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
      },
    });

    await logAudit({
      hospitalId,
      userId: session.sub,
      action: "STAFF_CREATED",
      entityType: "User",
      entityId: user.id,
      details: { name: user.name, role: user.role },
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      tempPassword,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
