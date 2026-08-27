import "server-only";
import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import type { StaffRole } from "@/lib/auth/constants";
import { QueueError } from "@/lib/queue/engine";
import { prisma } from "@/lib/prisma";

export class ApiAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Route-handler auth guard. API routes aren't covered by src/proxy.ts
 * (which only matches page prefixes), so every handler must call this
 * itself — see the Next.js Proxy guidance on not relying on it alone. */
export async function requireApiSession(roles?: StaffRole[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiAuthError("Not authenticated.", 401);
  if (roles && !roles.includes(session.role)) {
    throw new ApiAuthError("You don't have permission to do this.", 403);
  }
  return session;
}

/** Resolves the hospital id a session may act on: Super Admin can pass any
 * hospitalId; every other role is pinned to their own hospital. */
export function resolveHospitalScope(session: SessionPayload, requestedHospitalId: string): string {
  if (session.role === "SUPER_ADMIN") return requestedHospitalId;
  if (session.hospitalId !== requestedHospitalId) {
    throw new ApiAuthError("You don't have access to this hospital.", 403);
  }
  return session.hospitalId;
}

/** Loads a doctor and checks the session is allowed to act on it: Super
 * Admin and Hospital Admin/Receptionist within the same hospital, or the
 * Doctor account that owns it. */
export async function loadDoctorForSession(doctorId: string, session: SessionPayload) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw new ApiAuthError("Doctor not found.", 404);

  if (session.role === "SUPER_ADMIN") return doctor;
  if (doctor.hospitalId !== session.hospitalId) {
    throw new ApiAuthError("You don't have access to this doctor's queue.", 403);
  }
  if (session.role === "DOCTOR" && doctor.userId !== session.sub) {
    throw new ApiAuthError("You can only manage your own queue.", 403);
  }
  return doctor;
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof QueueError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
