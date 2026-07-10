# Deployment Guide

TalentHub AI is built with Next.js and Supabase. The recommended approach for deployment is using **Vercel** for the frontend/Next.js application and **Supabase** for the managed database and authentication backend.

## 1. Supabase Setup (Backend)

Before deploying the frontend, ensure your Supabase project is properly configured.

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run your schema setup scripts (tables, RLS policies, functions).
3. Set up Authentication providers (Email/Password is the default for this project).
4. Retrieve your API credentials from **Project Settings > API**:
   - Project URL
   - anon `public` key
   - service_role `secret` key

## 2. Vercel Deployment (Frontend)

Vercel provides zero-configuration deployments for Next.js applications.

### Option A: Deploy via Vercel Dashboard
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New... > Project**.
3. Import your TalentHub AI repository.
4. In the "Environment Variables" section, add the following:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
   - `SUPABASE_SECRET_KEY`: Your Supabase service_role key (if utilized in server actions)
5. Click **Deploy**. Vercel will automatically detect Next.js, run `npm run build`, and deploy the application.

### Option B: Deploy via Vercel CLI
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project root.
3. Follow the prompts to link your project.
4. Add your environment variables when prompted or via the Vercel dashboard.
5. Deploy to production using `vercel --prod`.

## 3. Post-Deployment Checks

- **Authentication:** Attempt to register a new user and log in to verify Supabase Auth integration.
- **Database:** Ensure the dashboard loads data correctly and that you can create/update records (like saving a job).
- **Environment Variables:** Verify that no secret keys (`SUPABASE_SECRET_KEY`) are exposed to the browser client. Only `NEXT_PUBLIC_` variables should be sent to the browser.
