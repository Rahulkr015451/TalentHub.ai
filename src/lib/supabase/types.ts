// ─── Supabase Database Types ──────────────────────────────────
// Manually defined to match the SQL schema. These types are used
// by the Supabase client for type-safe queries.

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow;
        Insert: CompanyInsert;
        Update: Partial<CompanyInsert>;
      };
      jobs: {
        Row: JobRow;
        Insert: JobInsert;
        Update: Partial<JobInsert>;
      };
      applications: {
        Row: ApplicationRow;
        Insert: ApplicationInsert;
        Update: Partial<ApplicationInsert>;
      };
      saved_jobs: {
        Row: SavedJobRow;
        Insert: SavedJobInsert;
        Update: Partial<SavedJobInsert>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
      };
    };
  };
}

// ─── Companies ────────────────────────────────────────────────
export interface CompanyRow {
  id: string;
  name: string;
  logo_bg: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  rating: number | null;
  description: string | null;
  logo_letter: string | null;
  logo_color: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyInsert = Omit<CompanyRow, "id" | "created_at" | "updated_at">;

// ─── Jobs ─────────────────────────────────────────────────────
export interface JobRow {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  department: string;
  experience: string;
  salary_min: number;
  salary_max: number;
  skills: string[];
  match_score: number | null;
  responsibilities: string[] | null;
  benefits: string[] | null;
  ai_summary: string | null;
  missing_skills: string[] | null;
  status: string;
  posted_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields (not in DB, populated via query)
  company?: CompanyRow;
}

export type JobInsert = Omit<JobRow, "id" | "created_at" | "updated_at" | "company">;

// ─── Applications ─────────────────────────────────────────────
export interface ApplicationRow {
  id: string;
  user_email: string;
  user_name: string;
  job_id: string;
  status: string;
  match_score: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  job?: JobRow;
}

export type ApplicationInsert = Omit<ApplicationRow, "id" | "created_at" | "updated_at" | "job">;

// ─── Saved Jobs ───────────────────────────────────────────────
export interface SavedJobRow {
  id: string;
  user_email: string;
  job_id: string;
  created_at: string;
}

export type SavedJobInsert = Omit<SavedJobRow, "id" | "created_at">;

// ─── Profiles ─────────────────────────────────────────────────
export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  university: string | null;
  degree: string | null;
  grad_date: string | null;
  gpa: string | null;
  company: string | null;
  recruiter_title: string | null;
  resume_name: string | null;
  github_connected: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<ProfileRow, "id" | "created_at" | "updated_at">;
