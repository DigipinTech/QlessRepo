import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, resolveHospitalScope, handleApiError } from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";

const schema = z.object({ name: z.string().min(2).max(100) });

export async function GET(_req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/departments">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession();
    resolveHospitalScope(session, hospitalId);
    const departments = await prisma.department.findMany({
      where: { hospitalId },
      include: { _count: { select: { doctors: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ departments });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, ctx: RouteContext<"/api/hospitals/[hospitalId]/departments">) {
  try {
    const { hospitalId } = await ctx.params;
    const session = await requireApiSession(["HOSPITAL_ADMIN", "SUPER_ADMIN"]);
    resolveHospitalScope(session, hospitalId);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a department name." }, { status: 400 });
    }

    const department = await prisma.department.create({ data: { hospitalId, name: parsed.data.name } });
    await logAudit({
      hospitalId,
      userId: session.sub,
      action: "DEPARTMENT_CREATED",
      entityType: "Department",
      entityId: department.id,
      details: { name: department.name },
    });
    return NextResponse.json({ department });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A department with this name already exists." }, { status: 409 });
    }
    return handleApiError(err);
  }
}
