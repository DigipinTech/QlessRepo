export interface TokenPatient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: string | null;
}

export interface TokenDTO {
  id: string;
  tokenNumber: string;
  sequence: number;
  visitType: "NEW" | "FOLLOW_UP";
  status: "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  isEmergency: boolean;
  estimatedWaitMinutes: number;
  queueDate: string;
  calledAt: string | null;
  completedAt: string | null;
  patient: TokenPatient;
}

export interface DoctorDTO {
  id: string;
  name: string;
  specialization: string;
  status: "ACTIVE" | "INACTIVE";
  isPaused: boolean;
  maxTokensPerDay: number;
  department: { id: string; name: string };
}

export interface QueueStatusDTO {
  doctor: DoctorDTO;
  session: { status: "OPEN" | "PAUSED" | "CLOSED"; lastTokenSeq: number } | null;
  current: TokenDTO | null;
  upcoming: TokenDTO[];
  waitingCount: number;
  tokens: TokenDTO[];
}
