import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken, QueueError } from "@/lib/queue/engine";

const schema = z.object({
  doctorId: z.string().min(1),
  name: z.string().min(2).max(120),
  mobile: z.string().min(6).max(20),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.string().max(30).optional(),
  visitType: z.enum(["NEW", "FOLLOW_UP"]),
});

export async function POST(req: Request, ctx: RouteContext<"/api/public/hospitals/[slug]/token">) {
  try {
    const { slug } = await ctx.params;
    const hospital = await prisma.hospital.findUnique({ where: { slug } });
    if (!hospital || hospital.status !== "ACTIVE") {
      return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
    }
    const { doctorId, ...patientInput } = parsed.data;

    const token = await generateToken({
      hospitalId: hospital.id,
      doctorId,
      visitType: patientInput.visitType,
      patient: {
        name: patientInput.name,
        mobile: patientInput.mobile,
        age: patientInput.age,
        gender: patientInput.gender,
      },
    });

    return NextResponse.json({ tokenId: token.id, tokenNumber: token.tokenNumber });
  } catch (err) {
    if (err instanceof QueueError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
