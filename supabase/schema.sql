-- ═══════════════════════════════════════════════════════════════
-- TalentHub AI — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Companies ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  logo_bg     TEXT NOT NULL DEFAULT 'bg-neutral-900 text-white',
  website     TEXT,
  industry    TEXT,
  size        TEXT,
  rating      NUMERIC(2,1),
  description TEXT,
  logo_letter TEXT,
  logo_color  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_name ON companies(name);

-- ─── 2. Jobs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  location         TEXT NOT NULL DEFAULT '',
  type             TEXT NOT NULL DEFAULT 'Remote',
  department       TEXT NOT NULL DEFAULT 'Engineering',
  experience       TEXT NOT NULL DEFAULT 'Mid',
  salary_min       INTEGER NOT NULL DEFAULT 0,
  salary_max       INTEGER NOT NULL DEFAULT 0,
  skills           TEXT[] NOT NULL DEFAULT '{}',
  match_score      INTEGER,
  responsibilities TEXT[],
  benefits         TEXT[],
  ai_summary       TEXT,
  missing_skills   TEXT[],
  status           TEXT NOT NULL DEFAULT 'open',
  posted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);

-- ─── 3. Applications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email  TEXT NOT NULL,
  user_name   TEXT NOT NULL DEFAULT '',
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'Applied',
  match_score INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_email, job_id)
);

CREATE INDEX idx_applications_user ON applications(user_email);
CREATE INDEX idx_applications_job ON applications(job_id);

-- ─── 4. Saved Jobs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_email, job_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_email);

-- ─── 5. Profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'candidate',
  phone            TEXT,
  location         TEXT,
  bio              TEXT,
  university       TEXT,
  degree           TEXT,
  grad_date        TEXT,
  gpa              TEXT,
  company          TEXT,
  recruiter_title  TEXT,
  resume_name      TEXT,
  github_connected BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ─── Disable RLS (no Supabase Auth integration yet) ──────────
ALTER TABLE companies    DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs         DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs   DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     DISABLE ROW LEVEL SECURITY;
