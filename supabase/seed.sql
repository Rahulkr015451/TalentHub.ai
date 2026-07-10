-- ═══════════════════════════════════════════════════════════════
-- TalentHub AI — Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Companies ────────────────────────────────────────────────
INSERT INTO companies (id, name, logo_bg, website, industry, size, rating, description, logo_letter, logo_color) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Linear', 'bg-neutral-900 text-white', 'https://linear.app', 'Software Development (SaaS)', '50-100', 4.9, 'The issue tracker you''ll enjoy using. Streamlined workflow for modern product teams.', 'L', 'from-neutral-700 to-neutral-900 dark:from-neutral-800 dark:to-neutral-950'),
  ('c0000001-0000-0000-0000-000000000002', 'Aether AI', 'bg-indigo-600 text-white', 'https://aether.ai', 'Artificial Intelligence', '10-50', 4.8, 'Cutting-edge AI research lab building next-generation language models.', 'A', 'from-indigo-500 to-indigo-700'),
  ('c0000001-0000-0000-0000-000000000003', 'Vercel', 'bg-black text-white', 'https://vercel.com', 'Developer Platforms', '250-500', 4.8, 'Vercel provides the developer experience and infrastructure to build, deploy, and scale.', '▲', 'from-black to-neutral-800 dark:from-neutral-900 dark:to-black'),
  ('c0000001-0000-0000-0000-000000000004', 'Stripe', 'bg-indigo-500 text-white', 'https://stripe.com', 'Financial Technology', '1000+', 4.7, 'Financial infrastructure for the internet. Millions of companies of all sizes use Stripe.', 'S', 'from-indigo-500 to-purple-600'),
  ('c0000001-0000-0000-0000-000000000005', 'Supabase', 'bg-emerald-600 text-white', 'https://supabase.com', 'Developer Tools', '100-250', 4.9, 'The open-source Firebase alternative with Postgres at its core.', 'S', 'from-emerald-500 to-emerald-700'),
  ('c0000001-0000-0000-0000-000000000006', 'Notion', 'bg-neutral-800 text-white', 'https://notion.so', 'Productivity Software', '500-1000', 4.6, 'A new tool that blends your everyday work apps into one. The all-in-one workspace.', 'N', 'from-neutral-700 to-neutral-900'),
  ('c0000001-0000-0000-0000-000000000007', 'Resend', 'bg-zinc-700 text-white', 'https://resend.com', 'Developer Tools', '10-50', 4.7, 'Email for developers. The best way to send transactional and marketing emails at scale.', 'R', 'from-zinc-600 to-zinc-800'),
  ('c0000001-0000-0000-0000-000000000008', 'Figma', 'bg-rose-500 text-white', 'https://figma.com', 'Design Tools', '500-1000', 4.8, 'A collaborative interface design tool used by millions of designers worldwide.', 'F', 'from-rose-400 to-rose-600'),
  ('c0000001-0000-0000-0000-000000000009', 'Retool', 'bg-amber-600 text-white', 'https://retool.com', 'Developer Tools', '250-500', 4.5, 'Build internal tools, remarkably fast. Visual development platform.', 'R', 'from-amber-500 to-amber-700'),
  ('c0000001-0000-0000-0000-000000000010', 'HashiCorp', 'bg-indigo-700 text-white', 'https://hashicorp.com', 'Cloud Infrastructure', '1000+', 4.6, 'Cloud infrastructure automation tools powering the modern datacenter.', 'H', 'from-indigo-600 to-indigo-800'),
  ('c0000001-0000-0000-0000-000000000011', 'Cockroach Labs', 'bg-emerald-700 text-white', 'https://cockroachlabs.com', 'Database Technology', '250-500', 4.5, 'Creators of CockroachDB, the most resilient cloud-native distributed SQL database.', 'C', 'from-emerald-600 to-emerald-800'),
  ('c0000001-0000-0000-0000-000000000012', 'PostHog', 'bg-amber-500 text-white', 'https://posthog.com', 'Analytics', '50-100', 4.7, 'Open-source product analytics, session recording, feature flags, and A/B testing.', 'P', 'from-amber-400 to-amber-600');

-- ─── Jobs ─────────────────────────────────────────────────────
INSERT INTO jobs (id, company_id, title, description, location, type, department, experience, salary_min, salary_max, skills, match_score, responsibilities, benefits, ai_summary, missing_skills, status, posted_at) VALUES
  ('j0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Senior React Engineer', 'Build the next generation of issue tracking tools. Work on performance-critical React features and design custom component architectures.', 'New York, NY', 'Remote', 'Engineering', 'Senior', 140000, 185000, ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Next.js'], 98,
    ARRAY['Architect and construct highly responsive client interfaces using Next.js and Tailwind CSS.', 'Collaborate directly with product design stakeholders to build reusable, accessible UI component ecosystems.', 'Profile and optimize rendering performance across complex project workspaces.', 'Mentor mid-level frontend developers, implementing engineering best practices and rigorous code audits.'],
    ARRAY['Competitive equity options and direct profit-sharing plans.', 'Comprehensive healthcare, vision, and dental covers (100% premium matched).', 'Flexible work setups with $2,000 yearly home-office stipend.', 'Unlimited paid time off (with 3 weeks mandatory minimum).'],
    'Your experience with Next.js edge adapters and typed component patterns aligns perfectly with Linear''s frontend performance objectives.', ARRAY['Go', 'GraphQL'], 'open', '2026-07-08T10:00:00Z'),

  ('j0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'AI Researcher (LLMs)', 'Develop cutting-edge models for candidate match scoring and semantic extraction pipelines. Refine vector retrieval strategies.', 'San Francisco, CA', 'Hybrid', 'Engineering', 'Lead', 190000, 260000, ARRAY['Python', 'PyTorch', 'Transformers', 'LLMs'], 96,
    ARRAY['Investigate and implement fine-tuning strategies for open-weight language models.', 'Optimize semantic embeddings indexing parameters for dense vectors lookup.', 'Design metrics evaluation frameworks to monitor AI recommendations drift.', 'Publish key findings at leading machine learning research forums.'],
    ARRAY['Access to premium high-end compute infrastructure clusters.', 'Comprehensive medical coverage with health savings accounts.', 'Generous relocation assistance packs for San Francisco.', 'Weekly team learning seminars and research allowances.'],
    'Your PyTorch expertise and background in vector metrics align tightly with Aether''s model training objectives.', ARRAY['Kubernetes', 'Rust'], 'open', '2026-07-09T08:00:00Z'),

  ('j0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003', 'Senior Product Designer', 'Design premium dashboards and interfaces for host deployment workflows. Elevate user flows and visual standards across core apps.', 'Remote, Global', 'Remote', 'Design', 'Senior', 130000, 175000, ARRAY['Figma', 'Design Systems', 'UI/UX', 'CSS'], 92,
    ARRAY['Design layout systems, tables, and data visualizers for serverless management dashboards.', 'Translate complex workflow states into clear, intuitive step-by-step forms.', 'Write semantic, clean layout CSS code templates for design system handoffs.', 'Perform accessibility audits to guarantee compliance with WCAG 2.2 standards.'],
    ARRAY['Vercel options equity allocation.', 'Global travel budgets for yearly team summits.', 'Comprehensive healthcare plans and mental wellness support.', 'Monthly workspace and internet subscription stipend.'],
    'Your strong design system background matches Vercel''s visual density requirements.', ARRAY['Framer Motion', 'Tailwind CSS'], 'open', '2026-07-07T12:00:00Z'),

  ('j0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000004', 'Product Manager - API Platforms', 'Shape the developer experience for internet payments API infrastructure. Define roadmap alignments and drive enterprise adoption.', 'Seattle, WA', 'Onsite', 'Product', 'Mid', 160000, 210000, ARRAY['Product Management', 'APIs', 'Fintech', 'SQL'], 94,
    ARRAY['Synthesize feedback from developers to define product roadmap priorities.', 'Maintain clear technical documentation guides for payment processing flows.', 'Conduct user alignment surveys and analyze usage telemetry logs.', 'Coordinate with engineering and risk teams to execute platform deployments.'],
    ARRAY['Stripe stock equity compensation plans.', 'Onsite dining, gym, and commuter transit allowances.', '100% matched 401(k) retirement schemes.', 'Paid family leave and health advisory resources.'],
    'Your technical background in API design aligns with Stripe''s developer-focused ecosystem.', ARRAY['Go', 'Kafka'], 'open', '2026-07-06T15:30:00Z'),

  ('j0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000005', 'Developer Advocate', 'Create tutorials, speak at conferences, and build open-source databases tooling integrations.', 'Remote', 'Remote', 'Marketing', 'Mid', 110000, 150000, ARRAY['PostgreSQL', 'React', 'Developer Relations', 'Writing'], 89, NULL, NULL, NULL, NULL, 'open', '2026-07-05T09:00:00Z'),

  ('j0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000006', 'Director of Engineering', 'Lead the Core Workspace engineering team, driving productivity editor performance.', 'San Francisco, CA', 'Hybrid', 'Engineering', 'Executive', 220000, 280000, ARRAY['Leadership', 'Agile', 'System Design', 'Architecture'], 95, NULL, NULL, NULL, NULL, 'open', '2026-07-09T11:00:00Z'),

  ('j0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000007', 'Junior Frontend Developer', 'Kickstart your career working on next-gen email design editors and modern APIs.', 'Remote, US', 'Remote', 'Engineering', 'Entry', 80000, 110000, ARRAY['React', 'TypeScript', 'Tailwind CSS'], 85, NULL, NULL, NULL, NULL, 'open', '2026-07-09T02:00:00Z'),

  ('j0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000008', 'Staff Designer', 'Design tools that empower millions of product designers worldwide to build visually spectacular UI.', 'New York, NY', 'Hybrid', 'Design', 'Lead', 180000, 230000, ARRAY['Figma', 'Visual Design', 'Prototyping', 'Design Systems'], 91, NULL, NULL, NULL, NULL, 'open', '2026-07-04T10:00:00Z'),

  ('j0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000009', 'Product Marketing Manager', 'Drive positioning, campaigns, and developer adoption for Retool internal databases tools.', 'San Francisco, CA', 'Onsite', 'Marketing', 'Mid', 120000, 160000, ARRAY['Go-To-Market', 'Copywriting', 'Developer Marketing'], 88, NULL, NULL, NULL, NULL, 'open', '2026-07-03T16:00:00Z'),

  ('j0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000010', 'Lead Cloud Infrastructure Engineer', 'Build next-generation configuration tools for modern cloud deployments.', 'Remote', 'Remote', 'Engineering', 'Lead', 170000, 220000, ARRAY['Terraform', 'Go', 'AWS', 'Docker'], 97, NULL, NULL, NULL, NULL, 'open', '2026-07-08T14:00:00Z'),

  ('j0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000011', 'Senior Backend Developer (Go)', 'Architect core features of the most resilient distributed SQL engine.', 'New York, NY', 'Hybrid', 'Engineering', 'Senior', 150000, 195000, ARRAY['Go', 'Distributed Systems', 'SQL', 'Database Design'], 93, NULL, NULL, NULL, NULL, 'open', '2026-07-06T11:00:00Z'),

  ('j0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000012', 'Associate Product Manager', 'Own features for analytics and session recording toolkits used by developers.', 'Remote', 'Remote', 'Product', 'Entry', 90000, 120000, ARRAY['Product Analysis', 'A/B Testing', 'Telemetry'], 87, NULL, NULL, NULL, NULL, 'open', '2026-07-08T15:00:00Z');

-- ─── Sample Applications ──────────────────────────────────────
INSERT INTO applications (user_email, user_name, job_id, status, match_score) VALUES
  ('alex@university.edu', 'Alex Rivera', 'j0000001-0000-0000-0000-000000000001', 'Interview', 98),
  ('alex@university.edu', 'Alex Rivera', 'j0000001-0000-0000-0000-000000000003', 'Screening', 92),
  ('alex@university.edu', 'Alex Rivera', 'j0000001-0000-0000-0000-000000000005', 'Applied', 89);

-- ─── Sample Saved Jobs ────────────────────────────────────────
INSERT INTO saved_jobs (user_email, job_id) VALUES
  ('alex@university.edu', 'j0000001-0000-0000-0000-000000000002'),
  ('alex@university.edu', 'j0000001-0000-0000-0000-000000000010');

-- ─── Sample Profile ───────────────────────────────────────────
INSERT INTO profiles (email, name, role, phone, location, bio, university, degree, grad_date, gpa, resume_name, github_connected) VALUES
  ('alex@university.edu', 'Alex Rivera', 'candidate', '+1 (555) 019-2834', 'Stanford, CA', 'Senior Computer Science Student at Stanford, specializing in Machine Learning & Frontend Engineering.', 'Stanford University', 'B.S. in Computer Science', 'June 2027', '3.92', 'Alex_Rivera_Resume_ML.pdf', true);
