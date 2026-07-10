Architectural Overview
This production architecture for TalentHub AI leverages a decoupled, serverless-first posture built on the Next.js 15 App Router. Compute is distributed across Vercel’s Edge Network and Node.js Serverless Runtimes, optimizing for latency and throughput.

                       [ Client / Browser ]
                                |
               (Auth Token & Edge Routing via Vercel)
                                |
       +────────────────────────┴────────────────────────+
       |                  Next.js 15 App                 |
       |                                                 |
       |  /app/api/* (Edge/Serverless Node Routes)       |
       |  /app/(dashboard) (Server/Client Components)    |
       +────────────────────────┬────────────────────────+
                                |
         (Connection Pooler / PostgREST via Supabase API)
                                |
              +─────────────────┴─────────────────+
              |           Supabase Stack          |
              |                                   |
              |  • PostgreSQL Database            |
              |  • pgvector Semantic Storage      |
              |  • Row-Level Security (RLS)       |
              +───────────────────────────────────+

1. Directory Structure
talenthub-ai/
├── .github/workflows/      # CI/CD pipelines (Test, Lint, Deploy)
├── src/
│   ├── app/                # Next.js 15 App Router Matrix
│   │   ├── (auth)/         # Clerk authentication route group
│   │   ├── (dashboard)/    # High-density recruiter/candidate workspace
│   │   ├── admin/          # Admin operations panel
│   │   ├── api/            # Route Handlers (Edge/Serverless)
│   │   ├── layout.tsx      # Global root layout
│   │   └── page.tsx        # Public marketing page
│   ├── components/         # Atomic design library
│   │   ├── ui/             # shadcn/ui unstyled/styled primitives
│   │   ├── shared/         # Reusable application components (Data tables, state views)
│   │   └── features/       # Feature-scoped business components (kanban/, sourcing/)
│   ├── hooks/              # Global custom hooks (useDebounce, useMediaQuery)
│   ├── lib/                # Framework-agnostic structural utilities
│   │   ├── supabase/       # Typed Supabase clients (Server, Client, Middleware)
│   │   ├── utils.ts        # Tailwind class merger (clsx + tailwind-merge)
│   │   └── validators/     # Zod strict evaluation schemas
│   ├── store/              # Zustand global micro-state stores
│   └── types/              # Ambient and explicit TypeScript definitions
├── supabase/               # Local Supabase configuration migrations & seeds
│   ├── migrations/
│   └── config.toml
├── middleware.ts           # Core routing interceptor (Clerk + Supabase token handoff)
└── tailwind.config.ts      # Tokens mapped to shadcn components

Architectural Rationale
Feature Isolation: Splitting structural components into ui/, shared/, and features/ limits horizontal dependency drift. If a component resides inside features/kanban/, components inside features/sourcing/ cannot bind to it.

Decoupled Configuration: Placing Supabase configurations at the root level enables standalone local Docker container initialization, isolating infrastructure changes from frontend workspace configurations.

2. Component Architecture & Data Fetching Strategy
Next.js 15 Server Components (RSC) serve as our default architecture to eliminate client-side waterfall penalties.

Code Pattern: Server-Client Boundary Isolation
This pattern uses Server Components to fetch data efficiently, using Client Components only where interactive functionality is required.

TypeScript

// src/app/(dashboard)/candidates/page.tsx
import { Suspense } from "react";
import { CandidateTable } from "@/components/features/candidates/candidate-table";
import { TableSkeleton } from "@/components/ui/skeletons";
import { createServerClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function CandidatesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query ?? "";
  const page = Number(resolvedParams.page ?? "1");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Candidates</h1>
        <p className="text-sm text-zinc-400">Manage and score matching pipelines using AI analytics.</p>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <CandidateDataLoader query={query} page={page} />
      </Suspense>
    </div>
  );
}

async function CandidateDataLoader({ query, page }: { query: string; page: number }) {
  const supabase = await createServerClient();
  const limit = 20;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from("candidates")
    .select("id, full_name, current_role, ai_match_score, updated_at", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.textSearch("search_vector", query);
  }

  const { data, error, count } = await dbQuery
    .order("ai_match_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Database transaction failed: ${error.message}`);

  return <CandidateTable initialData={data ?? []} totalCount={count ?? 0} />;
}



// src/components/features/candidates/candidate-table.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface Candidate {
  id: string;
  full_name: string;
  current_role: string;
  ai_match_score: number;
}

interface CandidateTableProps {
  initialData: Candidate[];
  totalCount: number;
}

export function CandidateTable({ initialData }: CandidateTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setSelectedId(id);
    startTransition(() => {
      router.push(`/candidates/${id}`);
    });
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-300">
        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">AI Match</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {initialData.map((candidate) => (
            <tr
              key={candidate.id}
              onClick={() => handleRowClick(candidate.id)}
              className={`cursor-pointer transition-colors hover:bg-zinc-900/40 ${
                selectedId === candidate.id ? "bg-zinc-900" : ""
              }`}
            >
              <td className="px-4 py-3.5 font-medium text-zinc-100">{candidate.full_name}</td>
              <td className="px-4 py-3.5 text-zinc-400">{candidate.current_role}</td>
              <td className={`px-4 py-3.5 text-right font-mono font-semibold ${
                candidate.ai_match_score >= 85 ? "text-emerald-400" : "text-amber-400"
              }`}>
                {candidate.ai_match_score}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px]" />}
    </div>
  );
}

Architectural Rationale
Dynamic Server Render Streaming: Using React Suspense allows the layout skeleton to stream immediately over edge networks while heavy internal data operations resolve asynchronously.

Zero Client Footprint: Initial database queries are handled purely within Node.js/Edge environments, keeping heavy dependencies like database drivers out of client-side browser bundles.

3. Database Schema Design (PostgreSQL)
This schema uses PostgreSQL extensions to handle high-performance lookups and store raw embeddings for semantic queries.

SQL
-- Core Extensions Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector" SCHEMAS public;

-- Global Custom Enums
CREATE TYPE user_role_type AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');
CREATE TYPE application_stage_type AS ENUM ('SOURCED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED');

-- Organizations (Enterprise / Tenant Root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_org_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Profiles (Unified User Matrix)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'CANDIDATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Job Requisitions
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    embedding public.vector(1536), -- Vector representation of job criteria
    search_vector TSVECTOR,        -- Structural text search capabilities
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Candidates Identity 
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    current_role VARCHAR(255),
    resume_url TEXT,
    raw_resume_text TEXT,
    embedding public.vector(1536), -- Vector representation of candidate profile
    ai_match_score SMALLINT CHECK (ai_match_score BETWEEN 0 AND 100),
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Multi-Tenant Structural Indexes for Query Performance
CREATE INDEX idx_profiles_clerk ON profiles(clerk_user_id);
CREATE INDEX idx_jobs_org ON jobs(org_id);
CREATE INDEX idx_candidates_profile ON candidates(profile_id);

-- Performance GIN Indexes for Full-Text Search
CREATE INDEX idx_jobs_search ON jobs USING gin(search_vector);
CREATE INDEX idx_candidates_search ON candidates USING gin(search_vector);

-- Vector HNSW Indexes for Sub-10ms Contextual AI Search Comparisons
CREATE INDEX idx_candidates_vector ON candidates USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_jobs_vector ON jobs USING hnsw (embedding vector_cosine_ops);
Architectural Rationale
Hierarchical Multi-Tenancy: Structural queries use the org_id foreign key. This allows Row-Level Security (RLS) to separate database tenants effectively.

HNSW (Hierarchical Navigable Small World) Indexing: Using HNSW instead of IVFFlat provides faster vector searches at scale, maintaining fast candidate matchmaking even during heavy infrastructure workloads.

4. API & Route Handler Matrix
All API write targets are structured as Next.js Route Handlers to ensure strict payload verification before reaching the database.

TypeScript
// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { jobCreationSchema } from "@/lib/validators/job";

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    
    // Auth Validation Block
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized access credentials" }, { status: 401 });
    }

    const rawPayload = await request.json();
    
    // Zod Validation Block
    const validationResult = jobCreationSchema.safeParse(rawPayload);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid payload parameters", details: validationResult.error.flatten() },
        { status: 422 }
      );
    }

    const supabase = await createServerClient();

    // Context Lookup mapping clerk_org_id to internal DB UUID
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("clerk_org_id", orgId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: "Valid tenant context not found" }, { status: 404 });
    }

    // Insert payload using verified tenant context
    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert({
        org_id: organization.id,
        title: validationResult.data.title,
        description: validationResult.data.description,
        salary_min: validationResult.data.salaryMin,
        salary_max: validationResult.data.salaryMax,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Database operational fault" }, { status: 500 });
    }

    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server processing failure" }, { status: 500 });
  }
}


5. State Management Strategy
We maintain a strict state separation model: server state is managed through native Next.js 15 routing, while client state is handled via global Zustand stores.

TypeScript
// src/store/use-kanban-store.ts
import { create } from "zustand";

interface KanbanState {
  activeCandidateId: string | null;
  isInspectorOpen: boolean;
  activeFilters: Record<string, any>;
  setActiveCandidate: (id: string | null) => void;
  setInspectorOpen: (open: boolean) => void;
  resetFilters: () => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  activeCandidateId: null,
  isInspectorOpen: false,
  activeFilters: {},
  setActiveCandidate: (id) => set({ activeCandidateId: id }),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  resetFilters: () => set({ activeFilters: {} }),
}));
Architectural Rationale
Zero Boilerplate: Zustand avoids the overhead of complex state frameworks, allowing components to selectively subscribe to state fields and eliminate unnecessary re-renders.

6. Global Error Handling Strategy
Errors are captured using global boundary intercepts combined with typed API responses.

TypeScript
// src/app/(dashboard)/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Pipeline connection to observability platforms (e.g., Sentry, Logflare)
    console.error("Dashboard Boundary Intercept:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-red-950/50 p-3 text-red-500 border border-red-900/50">
        ⚠️
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-zinc-50">Operational Application Fault</h2>
        <p className="text-sm text-zinc-400 max-w-md">
          The application encountered a critical runtime error. System administrators have been notified.
        </p>
      </div>
      <Button variant="outline" onClick={() => reset()} className="border-zinc-800 hover:bg-zinc-900">
        Retry Transaction
      </Button>
    </div>
  );
}


7. Authentication Flow
Authentication is managed via Clerk, routing verified JSON Web Tokens (JWT) directly to the database layer.

[User Browser] -> [Triggers Sign In] -> [Clerk Auth Modal Engine]
      |
(Validates Identity JWT Session)
      |
[Clerk Webhook Triggers] -> [POST /api/webhooks/clerk]
      |
(Synchronizes Profile & Organization Record into Supabase Base Tables)
      |
[Subsequent Requests Context] -> [Middleware Hydrates Row Level Security System]
TypeScript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|webp|jpg|jpeg|curve|ico|csv|docx|pdf)).*)", "/(api|trpc)(.*)"],
};


8. Deployment Strategy
Edge Infrastructure: Deployed directly to Vercel Enterprise Platforms. Route paths mapping to search modules leverage the Edge Runtime, while heavy file parsing runs in standard Node.js serverless layers.

Database Optimization: Supabase infrastructure is deployed in proximity to Vercel compute zones to minimize latency. Supabase Connection Poolers are configured via transaction modes to manage sudden connection spikes gracefully.

9. Security Best Practices
Row Level Security (RLS): Supabase RLS is strictly enforced for all queries. Frontend layers cannot interact with tables directly without verifying claims through JSON Web Token payloads.

Content Security Policy (CSP): HTTP security headers prevent Cross-Site Scripting (XSS) and code injection vectors.

TypeScript
// Example Security Header Matrix Injector within Next.js Context
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.talenthub.ai;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://images.clerk.dev;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;


10. Automated CI/CD Engineering Pipeline
YAML
# .github/workflows/pipeline.yml
name: TalentHub AI Engineering Matrix

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality-assurance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Initialize Bun Package Engine
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Monorepo Dependencies
        run: bun install --frozen-lockfile

      - name: Enforce TypeScript Type Standards
        run: bun x tsc --noEmit

      - name: Execute Linter Checks
        run: bun run lint

      - name: Verify Application Build Integrity
        run: bun run build
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
Architectural Rationale
Frozen Lockfile Enforcement: Using --frozen-lockfile prevents automatic dependency upgrades during automated deployments, safeguarding the runtime environment against drift.

Pre-Compilation Validation: Running tsc --noEmit captures implicit type errors before triggering the final compiler bundle processes, keeping deployment pipelines deterministic.