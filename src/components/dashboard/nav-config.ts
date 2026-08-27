import {
  LayoutDashboard,
  Hospital,
  Inbox,
  Building2,
  Stethoscope,
  Users,
  BarChart3,
  Bell,
  Ticket,
  UserPlus,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";
import type { StaffRole } from "@/lib/auth/constants";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<StaffRole, NavItem[]> = {
  SUPER_ADMIN: [
    { href: "/super-admin", label: "Overview", icon: LayoutDashboard },
    { href: "/super-admin/hospitals", label: "Hospitals", icon: Hospital },
    { href: "/super-admin/demo-requests", label: "Demo requests", icon: Inbox },
  ],
  HOSPITAL_ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
  ],
  DOCTOR: [{ href: "/doctor", label: "My queue", icon: Ticket }],
  RECEPTIONIST: [
    { href: "/reception", label: "New token", icon: UserPlus },
    { href: "/reception/queue", label: "Today's queue", icon: MonitorPlay },
  ],
};
