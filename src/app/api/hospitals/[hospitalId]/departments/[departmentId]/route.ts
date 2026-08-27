import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/hospitals/[hospitalId]/departments/[departmentId]">
) {
  try {
    const { hospitalId, departmentId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    resolveHospitalScope(session, hospitalId);

    const department = await prisma.department.findFirst({ where: { id: departmentId, hospitalId } });
    if (!department) throw new ApiAuthError("Department not found.", 404);

    const doctorCount = await prisma.doctor.count({ where: { departmentId } });
    if (doctorCount > 0) {
      throw new ApiAuthError("Move or remove this department's doctors before deleting it.", 409);
    }

    await prisma.department.delete({ where: { id: departmentId } });
    await logAudit({
      hospitalId,
      userId: session.sub,
      action: "DEPARTMENT_DELETED",
      entityType: "Department",
      entityId: departmentId,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
