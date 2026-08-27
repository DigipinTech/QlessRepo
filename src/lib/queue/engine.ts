import "server-only";
import { prisma } from "@/lib/prisma";
import { notify } from "./notify";
import { logAudit } from "@/lib/audit";
import type { Prisma, TokenStatus, VisitType } from "@/generated/prisma/client";

export const AVG_CONSULT_MINUTES = 8;
export const UPCOMING_TURN_THRESHOLD = 3;

export class QueueError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "QueueError";
  }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Every legal token-state transition. Anything not listed here is blocked
 * (BRD 7.4 / US-2.4: "Invalid transitions blocked"). */
const ALLOWED_TRANSITIONS: Record<TokenStatus, TokenStatus[]> = {
  WAITING: ["CALLED", "CANCELLED", "NO_SHOW"],
  CALLED: ["IN_CONSULTATION", "NO_SHOW", "CANCELLED"],
  IN_CONSULTATION: ["COMPLETED"],
  NO_SHOW: ["WAITING"], // rejoin queue
  COMPLETED: [],
  CANCELLED: [],
};

function assertTransition(from: TokenStatus, to: TokenStatus) {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw new QueueError(`Cannot move a token from ${from} to ${to}.`, 409);
  }
}

async function getOrCreateSession(
  tx: Prisma.TransactionClient,
  hospitalId: string,
  doctorId: string,
  queueDate: string
) {
  const existing = await tx.queueSession.findUnique({
    where: { doctorId_queueDate: { doctorId, queueDate } },
  });
  if (existing) return existing;
  return tx.queueSession.create({
    data: { hospitalId, doctorId, queueDate, status: "OPEN", lastTokenSeq: 0 },
  });
}

interface GenerateTokenInput {
  hospitalId: string;
  doctorId: string;
  visitType: VisitType;
  isEmergency?: boolean;
  patient: { name: string; mobile: string; age: number; gender?: string };
}

export async function generateToken(input: GenerateTokenInput) {
  const { hospitalId, doctorId, visitType, isEmergency = false, patient } = input;

  return prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id: doctorId, hospitalId } });
    if (!doctor) throw new QueueError("Doctor not found.", 404);
    if (doctor.status !== "ACTIVE") throw new QueueError("This doctor is not currently active.", 409);

    const queueDate = todayStr();
    const session = await getOrCreateSession(tx, hospitalId, doctorId, queueDate);
    if (session.status === "CLOSED") {
      throw new QueueError("Today's queue for this doctor has been closed.", 409);
    }

    const activeCount = await tx.token.count({
      where: { doctorId, queueDate, status: { notIn: ["CANCELLED"] } },
    });
    if (activeCount >= doctor.maxTokensPerDay) {
      throw new QueueError(
        `This doctor's daily token limit (${doctor.maxTokensPerDay}) has been reached.`,
        409
      );
    }

    const patientRecord = await tx.patient.create({
      data: {
        hospitalId,
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age,
        gender: patient.gender ?? null,
      },
    });

    const sequence = session.lastTokenSeq + 1;
    const tokenNumber = `${doctorPrefix(doctor.name)}-${String(sequence).padStart(3, "0")}`;

    const waitingAhead = await tx.token.count({
      where: { doctorId, queueDate, status: { in: ["WAITING", "CALLED"] } },
    });

    const token = await tx.token.create({
      data: {
        hospitalId,
        doctorId,
        patientId: patientRecord.id,
        queueSessionId: session.id,
        tokenNumber,
        sequence,
        visitType,
        isEmergency,
        status: "WAITING",
        estimatedWaitMinutes: waitingAhead * AVG_CONSULT_MINUTES,
        queueDate,
      },
    });

    await tx.queueSession.update({
      where: { id: session.id },
      data: { lastTokenSeq: sequence },
    });

    await notify(tx, {
      hospitalId,
      tokenId: token.id,
      channel: "SMS",
      event: "TOKEN_GENERATED",
      message: `Hi ${patient.name}, your QLess token ${tokenNumber} for ${doctor.name} is confirmed. Estimated wait: ${token.estimatedWaitMinutes} min.`,
    });

    await logAudit({
      hospitalId,
      action: "TOKEN_GENERATED",
      entityType: "Token",
      entityId: token.id,
      details: { tokenNumber, doctorId, patientMobile: patient.mobile },
    });

    return token;
  });
}

function doctorPrefix(name: string): string {
  const initials = name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return `D${initials.slice(0, 2) || "R"}`;
}

/** FIFO by default; an emergency-flagged waiting token jumps to the front. */
async function nextWaitingToken(tx: Prisma.TransactionClient, doctorId: string, queueDate: string) {
  return tx.token.findFirst({
    where: { doctorId, queueDate, status: "WAITING" },
    orderBy: [{ isEmergency: "desc" }, { sequence: "asc" }],
    include: { patient: true },
  });
}

export async function callNextToken(hospitalId: string, doctorId: string) {
  return prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id: doctorId, hospitalId } });
    if (!doctor) throw new QueueError("Doctor not found.", 404);
    if (doctor.isPaused) throw new QueueError("This doctor's queue is paused.", 409);

    const queueDate = todayStr();
    const session = await getOrCreateSession(tx, hospitalId, doctorId, queueDate);

    const inProgress = await tx.token.findFirst({
      where: { doctorId, queueDate, status: { in: ["CALLED", "IN_CONSULTATION"] } },
    });
    if (inProgress) {
      throw new QueueError(
        `Token ${inProgress.tokenNumber} is still ${inProgress.status === "CALLED" ? "waiting to be seen" : "in consultation"}.`,
        409
      );
    }

    const next = await nextWaitingToken(tx, doctorId, queueDate);
    if (!next) throw new QueueError("No patients waiting in this queue.", 404);

    assertTransition(next.status, "CALLED");
    const updated = await tx.token.update({
      where: { id: next.id },
      data: { status: "CALLED", calledAt: new Date() },
    });

    await tx.queueSession.update({ where: { id: session.id }, data: { currentTokenId: updated.id } });

    await notify(tx, {
      hospitalId,
      tokenId: updated.id,
      channel: "PUSH",
      event: "DOCTOR_CALLING",
      message: `${next.patient.name}, please proceed to ${doctor.name}'s room — you're being called now (token ${updated.tokenNumber}).`,
    });

    // Give the next few waiting patients a heads-up per BRD 7.7.
    const upcoming = await tx.token.findMany({
      where: { doctorId, queueDate, status: "WAITING" },
      orderBy: [{ isEmergency: "desc" }, { sequence: "asc" }],
      take: UPCOMING_TURN_THRESHOLD,
      include: { patient: true },
    });
    for (const t of upcoming) {
      await notify(tx, {
        hospitalId,
        tokenId: t.id,
        channel: "WHATSAPP",
        event: "UPCOMING_TURN",
        message: `${t.patient.name}, you're coming up soon for ${doctor.name} (token ${t.tokenNumber}). Please be nearby.`,
      });
    }

    await recalculateWaitEstimates(tx, doctorId, queueDate);

    await logAudit({
      hospitalId,
      action: "TOKEN_CALLED",
      entityType: "Token",
      entityId: updated.id,
      details: { tokenNumber: updated.tokenNumber },
    });

    return updated;
  });
}

async function recalculateWaitEstimates(tx: Prisma.TransactionClient, doctorId: string, queueDate: string) {
  const waiting = await tx.token.findMany({
    where: { doctorId, queueDate, status: "WAITING" },
    orderBy: [{ isEmergency: "desc" }, { sequence: "asc" }],
  });
  await Promise.all(
    waiting.map((t, i) =>
      tx.token.update({
        where: { id: t.id },
        data: { estimatedWaitMinutes: (i + 1) * AVG_CONSULT_MINUTES },
      })
    )
  );
}

interface TransitionOptions {
  hospitalId: string;
  tokenId: string;
  actorUserId?: string | null;
}

async function transitionToken(
  { hospitalId, tokenId, actorUserId }: TransitionOptions,
  to: TokenStatus,
  extra: Prisma.TokenUpdateInput = {}
) {
  return prisma.$transaction(async (tx) => {
    const token = await tx.token.findFirst({ where: { id: tokenId, hospitalId }, include: { patient: true } });
    if (!token) throw new QueueError("Token not found.", 404);
    assertTransition(token.status, to);

    const updated = await tx.token.update({ where: { id: token.id }, data: { status: to, ...extra } });

    await logAudit({
      hospitalId,
      userId: actorUserId,
      action: `TOKEN_${to}`,
      entityType: "Token",
      entityId: token.id,
      details: { tokenNumber: token.tokenNumber, from: token.status, to },
    });

    if (to === "WAITING") {
      const session = await getOrCreateSession(tx, hospitalId, token.doctorId, token.queueDate);
      const nextSeq = session.lastTokenSeq + 1;
      const rejoined = await tx.token.update({
        where: { id: token.id },
        data: { sequence: nextSeq },
      });
      await tx.queueSession.update({ where: { id: session.id }, data: { lastTokenSeq: nextSeq } });
      await recalculateWaitEstimates(tx, token.doctorId, token.queueDate);
      return rejoined;
    }

    await recalculateWaitEstimates(tx, token.doctorId, token.queueDate);

    return updated;
  });
}

export function startConsultation(opts: TransitionOptions) {
  return transitionToken(opts, "IN_CONSULTATION", { consultationStartAt: new Date() });
}

export function completeToken(opts: TransitionOptions) {
  return transitionToken(opts, "COMPLETED", { completedAt: new Date() });
}

export function markNoShow(opts: TransitionOptions) {
  return transitionToken(opts, "NO_SHOW");
}

export function rejoinQueue(opts: TransitionOptions) {
  return transitionToken(opts, "WAITING");
}

export function cancelToken(opts: TransitionOptions) {
  return transitionToken(opts, "CANCELLED", { cancelledAt: new Date() });
}

export async function setQueuePaused(hospitalId: string, doctorId: string, paused: boolean) {
  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, hospitalId } });
  if (!doctor) throw new QueueError("Doctor not found.", 404);
  const updated = await prisma.doctor.update({ where: { id: doctorId }, data: { isPaused: paused } });
  await prisma.queueSession.updateMany({
    where: { doctorId, queueDate: todayStr() },
    data: { status: paused ? "PAUSED" : "OPEN" },
  });
  await logAudit({
    hospitalId,
    action: paused ? "QUEUE_PAUSED" : "QUEUE_RESUMED",
    entityType: "Doctor",
    entityId: doctorId,
  });
  return updated;
}

export async function resetQueueForDay(hospitalId: string, doctorId: string, actorUserId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const queueDate = todayStr();
    const session = await tx.queueSession.findUnique({ where: { doctorId_queueDate: { doctorId, queueDate } } });
    if (!session) throw new QueueError("No active queue session to reset for today.", 404);

    const active = await tx.token.findMany({
      where: { doctorId, queueDate, status: { in: ["WAITING", "CALLED", "IN_CONSULTATION"] } },
    });
    for (const t of active) {
      await tx.token.update({ where: { id: t.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    }

    await tx.queueSession.update({
      where: { id: session.id },
      data: { status: "CLOSED", resetAt: new Date(), currentTokenId: null },
    });

    await notify(tx, {
      hospitalId,
      channel: "PUSH",
      event: "QUEUE_RESET",
      message: `The queue for today has been reset by hospital staff. ${active.length} pending token(s) were closed.`,
    });

    await logAudit({
      hospitalId,
      userId: actorUserId,
      action: "QUEUE_RESET",
      entityType: "QueueSession",
      entityId: session.id,
      details: { cancelledTokens: active.length },
    });

    return { closedTokens: active.length };
  });
}

export async function sendDelayNotification(hospitalId: string, doctorId: string, minutes: number) {
  return prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id: doctorId, hospitalId } });
    if (!doctor) throw new QueueError("Doctor not found.", 404);

    const waiting = await tx.token.findMany({
      where: { doctorId, queueDate: todayStr(), status: "WAITING" },
      include: { patient: true },
    });
    for (const t of waiting) {
      await notify(tx, {
        hospitalId,
        tokenId: t.id,
        channel: "SMS",
        event: "DELAY",
        message: `${t.patient.name}, ${doctor.name} is running about ${minutes} min behind schedule. Thanks for your patience.`,
      });
      await tx.token.update({
        where: { id: t.id },
        data: { estimatedWaitMinutes: t.estimatedWaitMinutes + minutes },
      });
    }

    await logAudit({
      hospitalId,
      action: "DELAY_NOTIFIED",
      entityType: "Doctor",
      entityId: doctorId,
      details: { minutes, notified: waiting.length },
    });

    return { notified: waiting.length };
  });
}

export async function getQueueStatus(hospitalId: string, doctorId: string) {
  const queueDate = todayStr();
  const [doctor, tokens, session] = await Promise.all([
    prisma.doctor.findFirst({ where: { id: doctorId, hospitalId }, include: { department: true } }),
    prisma.token.findMany({
      where: { doctorId, hospitalId, queueDate },
      orderBy: [{ isEmergency: "desc" }, { sequence: "asc" }],
      include: { patient: true },
    }),
    prisma.queueSession.findUnique({ where: { doctorId_queueDate: { doctorId, queueDate } } }),
  ]);
  if (!doctor) throw new QueueError("Doctor not found.", 404);

  const current = tokens.find((t) => t.status === "CALLED" || t.status === "IN_CONSULTATION") ?? null;
  const waiting = tokens.filter((t) => t.status === "WAITING");

  return {
    doctor,
    session,
    current,
    upcoming: waiting.slice(0, UPCOMING_TURN_THRESHOLD),
    waitingCount: waiting.length,
    tokens,
  };
}
