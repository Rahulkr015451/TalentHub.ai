<div align="center">
  <!-- Hero Image Placeholder -->
  <img src="https://via.placeholder.com/1200x400/000000/FFFFFF?text=TalentHub+AI+-+Next-Gen+Hiring+Platform" alt="TalentHub AI Hero" width="100%" />

  # TalentHub AI
  
  **An AI-powered hiring platform designed to streamline recruitment and empower candidates.**

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![CI/CD](https://github.com/yourusername/TalentHub_AI/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/TalentHub_AI/actions)
</div>

---

## 🌟 Features

### For Candidates
*   **AI Career Copilot:** Get personalized career path suggestions, skill gap analysis, and tailored learning resources.
*   **Smart Job Matching:** Discover opportunities aligned perfectly with your profile and experience.
*   **Real-time Activity Tracking:** Monitor application statuses, saved jobs, and profile updates dynamically.
*   **Modern Profile Management:** Build a standout portfolio with an intuitive interface.

### For Employers
*   **Advanced Applicant Tracking:** Manage candidates efficiently through customizable pipeline stages.
*   **AI-Enhanced Candidate Screening:** Leverage AI to evaluate applicant fit based on skills and requirements.
*   **Dynamic Analytics Dashboard:** Gain insights into hiring metrics, time-to-fill, and pipeline health.
*   **Seamless Job Posting:** Create and publish detailed job requirements effortlessly.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [@base-ui/react](https://base-ui.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Database & Auth:** [Supabase](https://supabase.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Form Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## 🏗️ Architecture

TalentHub AI leverages a modern, decoupled architecture tailored for scalability and performance:

*   **Frontend Layer:** Next.js App Router for optimal Server-Side Rendering (SSR) and Static Site Generation (SSG), providing a highly responsive user experience.
*   **State Layer:** Zustand manages global application state (like active session roles), while React context/hooks handle localized UI state.
*   **Data Layer:** Supabase serves as a robust Backend-as-a-Service (BaaS), handling PostgreSQL database operations, Row Level Security (RLS), and authentication via its client SDKs.
*   **Styling Layer:** Tailwind CSS combined with shadcn/ui provides a highly customizable, utility-first design system.

---

## 📁 Folder Structure

```text
TalentHub_AI/
├── .github/                 # GitHub workflows (CI/CD)
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/          # Authentication routes (Login, Register)
│   │   ├── (dashboard)/     # Protected dashboard routes (Recruiter & Candidate views)
│   │   ├── (marketing)/     # Public landing pages
│   │   └── api/             # API Routes
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Sidebar, Navbar, Shell components
│   │   ├── marketing/       # Landing page specific components
│   │   └── ui/              # shadcn/ui base components
│   ├── lib/                 # Utility functions and configurations
│   │   ├── supabase/        # Supabase client and data-access methods
│   │   └── utils.ts         # General helper functions (e.g., cn, dates)
│   └── types/               # Global TypeScript definitions
├── .env.example             # Environment variables template
├── package.json             # Project dependencies and scripts
└── tailwind.config.ts       # Tailwind CSS configuration
```

---

## 📸 Screenshots

<div align="center">
  <!-- Dashboard Screenshot Placeholder -->
  <img src="https://via.placeholder.com/800x450/1A202C/FFFFFF?text=Dashboard+Overview" alt="Dashboard View" width="80%" />
  <p><em>Comprehensive Analytics and Activity Dashboard</em></p>

  <!-- AI Copilot Screenshot Placeholder -->
  <img src="https://via.placeholder.com/800x450/2D3748/FFFFFF?text=AI+Career+Copilot" alt="AI Copilot View" width="80%" />
  <p><em>AI-Powered Career Guidance and Skill Analysis</em></p>
</div>

---

## ⚙️ Installation

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v20 or newer recommended)
*   npm or yarn or pnpm
*   A [Supabase](https://supabase.com/) account and project.

### Environment Variables

1.  Clone the repository and navigate into the project directory.
2.  Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```
3.  Fill in the required Supabase credentials in `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
    SUPABASE_SECRET_KEY=your_supabase_service_role_key
    ```
    *Note: Never commit `.env.local` to version control.*

---

## 🚀 Running Locally

1.  **Install dependencies:**
    ```bash
    npm ci
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🚢 Deployment

The easiest way to deploy TalentHub AI is via [Vercel](https://vercel.com/):

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.) in the Vercel project settings.
4.  Deploy! Vercel will automatically handle the build and hosting.

---

## 🔄 CI/CD

This project utilizes **GitHub Actions** for Continuous Integration.
The workflow (`.github/workflows/ci.yml`) automatically triggers on pushes and pull requests to the `main` branch. It ensures code quality by running:

1.  Dependency installation (`npm ci`)
2.  ESLint checks (`npm run lint`)
3.  TypeScript type checking (`npm run type-check`)
4.  A test production build (`npm run build`)

This guarantees that only passing, high-quality code is merged.

---

## 🔮 Future Scope

*   **Resume Parsing Integration:** Automatically extract skills and experience from uploaded PDF resumes.
*   **Video Interview Scheduling:** In-platform scheduling and conducting of initial screening interviews.
*   **Advanced AI Matching:** Fine-tuned matching algorithms using Large Language Models to assess cultural fit.
*   **Mobile Application:** Native mobile apps leveraging React Native connected to the same Supabase backend.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
