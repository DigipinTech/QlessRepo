import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireApiSession(["SUPER_ADMIN"]);
    const demoRequests = await prisma.demoRequest.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ demoRequests });
  } catch (err) {
    return handleApiError(err);
  }
}

const schema = z.object({
  organization: z.string().min(2).max(200),
  contactName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  role: z.string().max(60).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in the required fields with valid values." },
      { status: 400 }
    );
  }
  const { organization, contactName, email, phone, role, message } = parsed.data;

  await prisma.demoRequest.create({
    data: {
      organization,
      contactName,
      email,
      phone: phone || null,
      role: role || null,
      message: message || null,
    },
  });

  return NextResponse.json({ ok: true });
}
