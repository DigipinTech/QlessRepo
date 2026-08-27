import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: RouteContext<"/api/public/hospitals/[slug]">) {
  const { slug } = await ctx.params;
  const hospital = await prisma.hospital.findUnique({
    where: { slug },
    include: {
      departments: {
        include: {
          doctors: {
            where: { status: "ACTIVE" },
            select: { id: true, name: true, specialization: true, isPaused: true },
          },
        },
      },
    },
  });
  if (!hospital || hospital.status !== "ACTIVE") {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }

  return NextResponse.json({
    hospital: {
      id: hospital.id,
      name: hospital.name,
      slug: hospital.slug,
      address: hospital.address,
      departments: hospital.departments.map((d) => ({
        id: d.id,
        name: d.name,
        doctors: d.doctors,
      })),
    },
  });
}
