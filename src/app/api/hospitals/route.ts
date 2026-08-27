import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, handleApiError, ApiAuthError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/auth/password";
import { slugify, randomTempPassword } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(150),
  address: z.string().min(4).max(300),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  subscriptionPlan: z.enum(["BASIC", "PREMIUM"]),
  doctorLimit: z.coerce.number().int().min(1).max(500),
  subscriptionDays: z.coerce.number().int().min(1).max(3650),
  adminName: z.string().min(2).max(120),
  adminEmail: z.string().email(),
});

export async function GET() {
  try {
    await requireApiSession(["SUPER_ADMIN"]);
    const hospitals = await prisma.hospital.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { doctors: true, departments: true } } },
    });
    return NextResponse.json({ hospitals });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireApiSession(["SUPER_ADMIN"]);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the hospital details and try again." }, { status: 400 });
    }
    const data = parsed.data;

    const baseSlug = slugify(data.name) || "hospital";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.hospital.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const existingAdmin = await prisma.user.findUnique({ where: { email: data.adminEmail.toLowerCase() } });
    if (existingAdmin) {
      throw new ApiAuthError("A user with this admin email already exists.", 409);
    }

    const tempPassword = randomTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const hospital = await prisma.$transaction(async (tx) => {
      const created = await tx.hospital.create({
        data: {
          name: data.name,
          slug,
          address: data.address,
          phone: data.phone,
          email: data.email,
          status: "ACTIVE",
          subscriptionPlan: data.subscriptionPlan,
          doctorLimit: data.doctorLimit,
          subscriptionExpiry: new Date(Date.now() + data.subscriptionDays * 24 * 60 * 60 * 1000),
        },
      });
      await tx.user.create({
        data: {
          hospitalId: created.id,
          role: "HOSPITAL_ADMIN",
          name: data.adminName,
          email: data.adminEmail.toLowerCase(),
          passwordHash,
        },
      });
      return created;
    });

    await logAudit({
      action: "HOSPITAL_CREATED",
      entityType: "Hospital",
      entityId: hospital.id,
      details: { name: hospital.name, slug: hospital.slug },
    });

    return NextResponse.json({ hospital, adminTempPassword: tempPassword });
  } catch (err) {
    return handleApiError(err);
  }
}
