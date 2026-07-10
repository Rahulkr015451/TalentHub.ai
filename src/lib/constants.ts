import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  HelpCircle,
  Bell,
  Building2,
  FileText,
  UserPlus,
  Search,
  Brain,
} from "lucide-react";
import type { NavItem, SidebarItem } from "@/types";

// ─── Routes ───────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  JOBS: "/dashboard/jobs",
  JOB_CREATE: "/dashboard/jobs/create",
  CANDIDATES: "/dashboard/candidates",
  INTERVIEWS: "/dashboard/interviews",
  ANALYTICS: "/dashboard/analytics",
  SETTINGS: "/dashboard/settings",
  PROFILE: "/dashboard/profile",
  ORGANIZATION: "/dashboard/organization",
} as const;

// ─── Marketing Navigation ─────────────────────────────────────
export const MARKETING_NAV_ITEMS: NavItem[] = [
  { title: "Jobs", href: "/dashboard/jobs" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
];

// ─── Sidebar Navigation ──────────────────────────────────────
export const SIDEBAR_NAV_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    section: "main",
    roles: ["candidate", "recruiter"],
  },
  {
    title: "Jobs",
    href: ROUTES.JOBS,
    icon: Briefcase,
    section: "main",
    badge: "12",
    roles: ["candidate"],
  },
  {
    title: "AI Career Copilot",
    href: "/dashboard/ai",
    icon: Brain,
    section: "insights",
    roles: ["candidate"],
  },
  {
    title: "Candidates",
    href: ROUTES.CANDIDATES,
    icon: Users,
    section: "main",
    badge: "48",
    roles: ["recruiter"],
  },
  {
    title: "Interviews",
    href: ROUTES.INTERVIEWS,
    icon: CalendarCheck,
    section: "main",
    roles: ["recruiter"],
  },
  {
    title: "Analytics",
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
    section: "insights",
    roles: ["recruiter"],
  },
  {
    title: "Organization",
    href: ROUTES.ORGANIZATION,
    icon: Building2,
    section: "management",
    roles: ["recruiter"],
  },
  {
    title: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    section: "management",
    roles: ["candidate", "recruiter"],
  },
];

export const SIDEBAR_BOTTOM_ITEMS: SidebarItem[] = [
  {
    title: "Help & Support",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

// ─── Section Labels ───────────────────────────────────────────
export const SIDEBAR_SECTIONS: Record<string, string> = {
  main: "Main",
  insights: "Insights",
  management: "Management",
};

// ─── Dashboard Quick Actions ──────────────────────────────────
export const QUICK_ACTIONS = [
  { title: "Post a Job", href: ROUTES.JOB_CREATE, icon: FileText },
  { title: "Add Candidate", href: ROUTES.CANDIDATES, icon: UserPlus },
  { title: "Search Talent", href: ROUTES.CANDIDATES, icon: Search },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

// ─── Status Colors ────────────────────────────────────────────
export const JOB_STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const },
  open: { label: "Open", variant: "default" as const },
  paused: { label: "Paused", variant: "outline" as const },
  closed: { label: "Closed", variant: "destructive" as const },
  archived: { label: "Archived", variant: "secondary" as const },
} as const;

export const CANDIDATE_STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-500" },
  screening: { label: "Screening", color: "bg-yellow-500" },
  interview: { label: "Interview", color: "bg-purple-500" },
  assessment: { label: "Assessment", color: "bg-orange-500" },
  offer: { label: "Offer", color: "bg-emerald-500" },
  hired: { label: "Hired", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-500" },
} as const;

// ─── Pagination ───────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ─── Misc ─────────────────────────────────────────────────────
export const DEBOUNCE_DELAY = 300;
export const ANIMATION_DURATION = 0.2;
export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 68;
