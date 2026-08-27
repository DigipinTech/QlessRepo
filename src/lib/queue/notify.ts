import "server-only";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { NotificationChannel, NotificationEvent } from "@/generated/prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Records a simulated notification. There is no real SMS/WhatsApp/push
 * gateway in this demo — every "send" is logged here and surfaced in the
 * in-app notification feed, per BRD 7.7.
 */
export async function notify(
  tx: Tx,
  params: {
    hospitalId: string;
    tokenId?: string | null;
    channel: NotificationChannel;
    event: NotificationEvent;
    message: string;
  }
) {
  return tx.notificationLog.create({
    data: {
      hospitalId: params.hospitalId,
      tokenId: params.tokenId ?? null,
      channel: params.channel,
      event: params.event,
      message: params.message,
      status: "SENT",
    },
  });
}
