import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";
import type { StaffRole } from "./constants";
import { ROLE_HOME_PATH } from "./constants";

/** Page/layout guard: redirects to /login if unauthenticated, or to the
 * user's own home if authenticated but not permitted for this route. */
export async function requireRole(
  allowed: StaffRole | StaffRole[]
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedList.includes(session.role)) {
    redirect(ROLE_HOME_PATH[session.role]);
  }
  return session;
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession();
}
