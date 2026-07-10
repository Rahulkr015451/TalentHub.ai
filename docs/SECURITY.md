# Security Policy

Security is a top priority for TalentHub AI. This document outlines the security practices and mechanisms utilized within the project.

## 1. Authentication & Authorization

- **Provider:** All user authentication is handled by [Supabase Auth](https://supabase.com/docs/guides/auth).
- **Sessions:** User sessions are managed securely using HTTP-only cookies via the `@supabase/ssr` package.
- **Role-Based Access Control (RBAC):** The application differentiates between `candidate` and `recruiter` roles. Next.js middleware and Server Actions verify these roles before rendering protected views or mutating data.

## 2. Database Security (Row Level Security)

TalentHub AI leverages PostgreSQL's **Row Level Security (RLS)** via Supabase.
- **Direct Database Access is Blocked:** By default, all tables have RLS enabled, meaning a client querying the database receives no rows unless a specific policy grants them access.
- **Policies:**
  - *Candidates* can only read/update their own profiles and view their own applications.
  - *Recruiters* can only update their own job postings and view applications tied to their job postings.
- RLS ensures that even if the frontend logic has a flaw, the database layer prevents unauthorized data access.

## 3. Environment Variables

- **Strict Prefixing:** Only environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
- **Secret Keys:** Service role keys (e.g., `SUPABASE_SECRET_KEY`) or third-party API keys are strictly kept on the server side and never committed to version control.
- Ensure `.env.local`, `.env.development`, and `.env.production` are included in your `.gitignore`.

## 4. Next.js Security Features

- **Server Actions:** Data mutations are handled via Server Actions, meaning logic executes securely on the server, hiding implementation details and database queries from the client.
- **React Server Components (RSC):** The use of RSCs reduces the amount of JavaScript sent to the client, inherently minimizing the attack surface.

## 5. Reporting a Vulnerability

If you discover a security vulnerability within this project, please do not disclose it publicly.
Instead, please contact the repository maintainers directly via email or through private GitHub vulnerability reporting. We will review the issue and release a patch as quickly as possible.
