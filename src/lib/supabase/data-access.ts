import { supabase } from "./client";
import type { JobRow, CompanyRow, ApplicationRow, JobInsert } from "./types";

// ─── Jobs ─────────────────────────────────────────────────────

/** Fetch all jobs with their company details, ordered by posted_at desc. */
export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("status", "open")
    .order("posted_at", { ascending: false });

  return { data: data as (JobRow & { company: CompanyRow })[] | null, error };
}

/** Fetch a single job by ID with full company details. */
export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("id", id)
    .single();

  return { data: data as (JobRow & { company: CompanyRow }) | null, error };
}

/** Create a new job listing. */
export async function createJob(job: JobInsert) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();

  return { data: data as JobRow | null, error };
}

// ─── Companies ────────────────────────────────────────────────

/** Fetch all companies ordered by name. */
export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  return { data: data as CompanyRow[] | null, error };
}

/** Fetch a single company by ID. */
export async function getCompanyById(id: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  return { data: data as CompanyRow | null, error };
}

// ─── Applications ─────────────────────────────────────────────

/** Get all applications for a specific user email. */
export async function getApplicationsByUser(userEmail: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(*, company:companies(*))")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });

  return { data: data as ApplicationRow[] | null, error };
}

/** Get all applications (recruiter view — all applicants across jobs). */
export async function getAllApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(*, company:companies(*))")
    .order("created_at", { ascending: false });

  return { data: data as ApplicationRow[] | null, error };
}

/** Apply to a job (insert application). Returns error if already applied. */
export async function applyToJob(userEmail: string, userName: string, jobId: string) {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_email: userEmail,
      user_name: userName,
      job_id: jobId,
      status: "Applied",
      match_score: null,
    })
    .select()
    .single();

  return { data: data as ApplicationRow | null, error };
}

// ─── Saved Jobs ───────────────────────────────────────────────

/** Get all saved job IDs for a specific user email. */
export async function getSavedJobsByUser(userEmail: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_email", userEmail);

  return {
    data: data ? data.map((row) => row.job_id) : null,
    error,
  };
}

/** Toggle saved job: insert if not saved, delete if already saved. Returns new state. */
export async function toggleSaveJob(userEmail: string, jobId: string) {
  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_email", userEmail)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", existing.id);
    return { saved: false, error };
  } else {
    // Save
    const { error } = await supabase
      .from("saved_jobs")
      .insert({ user_email: userEmail, job_id: jobId });
    return { saved: true, error };
  }
}

/** Check if a specific job is saved by a user. */
export async function isJobSaved(userEmail: string, jobId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_email", userEmail)
    .eq("job_id", jobId)
    .maybeSingle();

  return { saved: !!data, error };
}

// ─── Application Count ───────────────────────────────────────

/** Count total applications for a user (for dashboard stat card). */
export async function getApplicationCount(userEmail: string) {
  const { count, error } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_email", userEmail);

  return { count: count ?? 0, error };
}

// ─── Company Profile Updates ─────────────────────────────────

/** Update an existing company profile details. */
export async function updateCompanyProfile(id: string, updates: Partial<CompanyRow>) {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data: data as CompanyRow | null, error };
}
