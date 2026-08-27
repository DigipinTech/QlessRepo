export const SESSION_COOKIE = "qless_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

export type StaffRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "RECEPTIONIST";

export const ROLE_HOME_PATH: Record<StaffRole, string> = {
  SUPER_ADMIN: "/super-admin",
  HOSPITAL_ADMIN: "/admin",
  DOCTOR: "/doctor",
  RECEPTIONIST: "/reception",
};

export const ROLE_LABEL: Record<StaffRole, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
};
