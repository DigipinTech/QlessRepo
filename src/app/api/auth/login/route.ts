import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { MAX_FAILED_LOGIN_ATTEMPTS, LOCKOUT_MINUTES, ROLE_HOME_PATH, type StaffRole } from "@/lib/auth/constants";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Uniform error message regardless of which check fails, to avoid
  // leaking whether an email exists (BRD 8.3 security requirements).
  const invalidCreds = () =>
    NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  if (!user || !user.isActive) return invalidCreds();

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Account locked due to failed attempts. Try again in ${minutesLeft} min.` },
      { status: 423 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
        : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
    if (lockedUntil) {
      return NextResponse.json(
        { error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` },
        { status: 423 }
      );
    }
    return invalidCreds();
  }

  if (user.hospitalId) {
    const hospital = await prisma.hospital.findUnique({ where: { id: user.hospitalId } });
    if (!hospital || hospital.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This hospital account is currently inactive. Contact QLess support." },
        { status: 403 }
      );
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const role = user.role as StaffRole;
  const token = await createSessionToken({
    sub: user.id,
    role,
    hospitalId: user.hospitalId,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  await logAudit({
    hospitalId: user.hospitalId,
    userId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
  });

  return NextResponse.json({
    role,
    name: user.name,
    redirectTo: ROLE_HOME_PATH[role],
  });
}
