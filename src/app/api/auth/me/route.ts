import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      name: session.name,
      email: session.email,
      role: session.role,
      hospitalId: session.hospitalId,
    },
  });
}
