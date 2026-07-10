# API Documentation

TalentHub AI leverages the Next.js **App Router** and **Server Actions** rather than traditional REST API routes (`/api/...`) for the majority of its data mutations. Data fetching is heavily integrated with the Supabase JavaScript client SDK.

## Data Access Pattern

All database interactions are centralized in the `src/lib/supabase/data-access.ts` utility file. This ensures a consistent approach to querying Supabase and enforces type safety.

### Supabase Client
The project uses `@supabase/ssr` to securely access the database from Server Components, Client Components, and Server Actions.

## Key Entities

### Jobs (`jobs` table)
- **Schema:** Contains job postings created by employers.
- **Operations:**
  - `getJobs()`: Fetches all active jobs (used in the candidate view).
  - `getJobById(id)`: Fetches details for a specific job.
  - Insertions/Updates are handled via Next.js Server Actions securely.

### Applications (`applications` table)
- **Schema:** Links a Candidate to a Job Posting.
- **Operations:**
  - Candidates can insert a new row to apply.
  - Employers can query applications filtered by their posted jobs to manage their ATS pipeline.

### User Profiles (`profiles` table)
- **Schema:** Extended user data beyond Supabase Auth (e.g., Role: Candidate vs. Recruiter).
- **Operations:**
  - Created automatically upon registration via a Supabase trigger or a post-signup Server Action.

## Server Actions Example

Mutations in TalentHub AI use React's server actions for enhanced security and progressive enhancement.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createApplication(jobId: string) {
  const supabase = createClient()
  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Insert application
  const { error } = await supabase
    .from('applications')
    .insert({ job_id: jobId, candidate_id: user.id, status: 'applied' })

  if (error) throw error
  
  // Revalidate the dashboard path to reflect changes
  revalidatePath('/dashboard')
}
```

## Third-Party Integrations
Currently, the primary integration is Supabase. Any future AI integrations (e.g., OpenAI API for the Career Copilot) should be implemented exclusively as Server Actions or API routes to prevent exposing API keys to the client.
