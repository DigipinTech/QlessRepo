import "server-only";
import { prisma } from "@/lib/prisma";

interface AuditParams {
  hospitalId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}

export async function logAudit({ hospitalId, userId, action, entityType, entityId, details }: AuditParams) {
  await prisma.auditLog.create({
    data: {
      hospitalId: hospitalId ?? null,
      userId: userId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      details: details ? JSON.stringify(details) : null,
    },
  });
}
