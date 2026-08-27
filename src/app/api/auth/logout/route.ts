import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  if (session) {
    await logAudit({
      hospitalId: session.hospitalId,
      userId: session.sub,
      action: "LOGOUT",
      entityType: "User",
      entityId: session.sub,
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
