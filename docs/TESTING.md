# Testing Strategy

TalentHub AI believes in maintaining high code quality through rigorous automated checks.

## Current Automated Checks

Our Continuous Integration (CI) pipeline runs the following checks on every pull request and push to the `main` branch:

1. **Linting (`npm run lint`):** 
   - Uses ESLint configured with `eslint-config-next` to enforce code style, identify problematic patterns, and ensure React best practices.
   - The CI will fail if any linting warnings or errors are present.

2. **Type Checking (`npm run type-check`):**
   - Uses the TypeScript compiler (`tsc --noEmit`) to verify strict type safety across the entire codebase.
   - Ensures that data models align perfectly with Supabase schema generations.

3. **Production Build (`npm run build`):**
   - Verifies that the Next.js application can compile successfully for a production environment.

## Future Testing Scope (Roadmap)

We plan to introduce the following testing layers in upcoming releases:

### 1. Unit Testing
- **Framework:** [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/).
- **Scope:** Testing utility functions (e.g., date formatting, class merging) and complex React hooks.

### 2. Component Testing
- **Framework:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
- **Scope:** Verifying that UI components render correctly given specific props, especially for complex interactive elements like the AI Career Copilot dashboard.

### 3. End-to-End (E2E) Testing
- **Framework:** [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/).
- **Scope:** Simulating critical user flows:
  - User registration and login (Candidate & Recruiter).
  - Creating a job posting (Recruiter).
  - Applying for a job (Candidate).
  - Viewing the dashboard analytics.

## Running Tests Locally

Currently, you can run the static analysis checks locally:

```bash
# Run ESLint
npm run lint

# Run TypeScript compilation check
npm run type-check
```
