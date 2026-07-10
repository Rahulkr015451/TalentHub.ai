import type { LucideIcon } from "lucide-react";

// ─── Navigation ───────────────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
  description?: string;
}

export interface SidebarItem extends NavItem {
  items?: SidebarItem[];
  section?: string;
  roles?: string[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

// ─── API ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | string[]>;
}

// ─── User ─────────────────────────────────────────────────────
export type UserRole = "admin" | "recruiter" | "hiring_manager" | "interviewer";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Jobs ─────────────────────────────────────────────────────
export type JobStatus = "draft" | "open" | "paused" | "closed" | "archived";
export type JobType = "full_time" | "part_time" | "contract" | "internship";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  postedAt?: string;
  closingDate?: string;
  applicantCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Candidates ───────────────────────────────────────────────
export type CandidateStatus =
  | "new"
  | "screening"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  resumeUrl?: string;
  status: CandidateStatus;
  appliedJobId: string;
  matchScore?: number;
  skills: string[];
  experience: number;
  location?: string;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
}

// ─── Interviews ───────────────────────────────────────────────
export type InterviewType = "phone" | "video" | "onsite" | "technical" | "panel";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  duration: number; // minutes
  interviewers: string[];
  feedback?: string;
  rating?: number;
  meetingUrl?: string;
}

// ─── Analytics ────────────────────────────────────────────────
export interface AnalyticsStat {
  label: string;
  value: number;
  change?: number; // percentage change
  changeType?: "increase" | "decrease" | "neutral";
  icon?: LucideIcon;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ─── UI Helpers ───────────────────────────────────────────────
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type Theme = "light" | "dark" | "system";
