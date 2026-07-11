"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Search,
  MapPin,
  Star,
  Clock,
  ChevronDown,
  X,
  Filter,
  Brain,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getJobs, getCompanies } from "@/lib/supabase/data-access";
import type { JobRow, CompanyRow } from "@/lib/supabase/types";

// ─── TYPES FOR MARKETING PAGE ────────────────────────
interface MarketingJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  department: string;
  isRemote: boolean;
  tags: string[];
  matchScore: number;
  logoBg: string;
}

interface MarketingCompany {
  name: string;
  activeJobs: number;
  rating: number;
  description: string;
  tags: string[];
  logoLetter: string;
  logoColor: string;
}

// ─── DATA MAPPING HELPERS ────────────────────────
const mapDbJobToMarketingJob = (dbJob: JobRow & { company?: CompanyRow | null }): MarketingJob => ({
  id: dbJob.id,
  title: dbJob.title,
  company: dbJob.company?.name || "Company",
  location: dbJob.location,
  type: dbJob.type,
  salary: `$${Math.round(dbJob.salary_min / 1000)}k - $${Math.round(dbJob.salary_max / 1000)}k`,
  department: dbJob.department,
  isRemote: dbJob.type === "Remote",
  tags: dbJob.skills || [],
  matchScore: dbJob.match_score || 90,
  logoBg: dbJob.company?.logo_bg || "bg-indigo-500/10 text-indigo-500",
});

const mapDbCompanyToMarketingCompany = (dbCompany: CompanyRow, allJobs: (JobRow & { company?: CompanyRow | null })[] | null): MarketingCompany => {
  const activeCount = allJobs ? allJobs.filter((job) => job.company_id === dbCompany.id).length : 0;
  return {
    name: dbCompany.name,
    activeJobs: activeCount,
    rating: dbCompany.rating || 4.5,
    description: dbCompany.description || "",
    tags: dbCompany.industry ? [dbCompany.industry, dbCompany.size].filter(Boolean) as string[] : ["Software"],
    logoLetter: dbCompany.logo_letter || dbCompany.name.charAt(0),
    logoColor: dbCompany.logo_color || "from-neutral-700 to-neutral-900",
  };
};

export default function MarketingPage() {
  const router = useRouter();
  // --- STATE DECLARATIONS FIRST (to resolve declaration-order / access-before-declaration bugs) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDept, setSearchDept] = useState("All");
  const [searchRemote, setSearchRemote] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<MarketingJob[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  
  const [session, setSession] = useState<{ loggedIn: boolean; role?: string } | null>(null);
  const [allJobs, setAllJobs] = useState<MarketingJob[]>([]);
  const [companies, setCompanies] = useState<MarketingCompany[]>([]);
  const [visibleCompaniesCount, setVisibleCompaniesCount] = useState(3);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("talenthub-session");
    if (raw) {
      const parsedSession = JSON.parse(raw);
      if (parsedSession.loggedIn && parsedSession.role === "recruiter") {
        router.push("/employer");
        return;
      }
      requestAnimationFrame(() => {
        setSession(parsedSession);
      });
    } else {
      requestAnimationFrame(() => {
        setSession({ loggedIn: false });
      });
    }

    async function loadLandingData() {
      try {
        const { data: dbJobs } = await getJobs();
        const { data: dbCompanies } = await getCompanies();

        let mappedJobs: MarketingJob[] = [];
        if (dbJobs) {
          mappedJobs = (dbJobs as (JobRow & { company: CompanyRow })[]).map(mapDbJobToMarketingJob);
          setAllJobs(mappedJobs);
          setFilteredJobs(mappedJobs);
        }

        if (dbCompanies) {
          setCompanies((dbCompanies as CompanyRow[]).map((c) => mapDbCompanyToMarketingCompany(c, dbJobs as (JobRow & { company: CompanyRow })[] | null)));
        }
      } catch (err) {
        console.error("Failed to load landing page data", err);
      }
    }

    loadLandingData();
  }, []);

  // --- JOB FILTER LOGIC ---
  useEffect(() => {
    let result = allJobs;
    if (searchQuery.trim()) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.tags as string[]).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (searchDept !== "All") {
      result = result.filter((job) => job.department === searchDept);
    }
    if (searchRemote) {
      result = result.filter((job) => job.isRemote);
    }
    requestAnimationFrame(() => {
      setFilteredJobs(result);
      setVisibleCount(3);
    });
  }, [searchQuery, searchDept, searchRemote, allJobs]);



  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* ──────────────────────────────────────────────────────────
          HERO SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92dvh] flex items-center justify-center pt-28 pb-16 lg:pt-36 lg:pb-24">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-primary/10 blur-[80px] sm:blur-[120px] animate-pulse dark:bg-primary/5" />
          <div className="absolute bottom-[20%] right-[-10%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-accent/10 blur-[70px] sm:blur-[110px] dark:bg-accent/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-30 dark:opacity-15" />
        </div>

        <Container>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3 text-primary animate-pulse" />
              <span className="text-muted-foreground">The AI-Powered Tech Job Board of the Future</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] font-heading"
            >
              Find & Land Your Next <br className="hidden sm:inline" />
              <span className="text-gradient">Dream Tech Job</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              TalentHub unites advanced resume compatibility matching, direct employer application channels, and automated application tracking tools. Find your next role, 10x faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto gap-2 group shrink-0 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold" render={<Link href="/dashboard/jobs" />}>
                View Active Jobs
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              {session?.loggedIn ? (
                <Button size="lg" variant="outline" className="w-full sm:w-auto shrink-0 border-primary/20 hover:border-primary/45" render={<Link href="/dashboard" />}>
                  Go to Dashboard
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="w-full sm:w-auto shrink-0 border-primary/20 hover:border-primary/45" render={<Link href="/register" />}>
                  Sign Up Account
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground/80"
            >
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="size-8 rounded-full border-2 border-background bg-muted overflow-hidden flex items-center justify-center text-[10px] font-bold">
                    {`U${i}`}
                  </div>
                ))}
              </div>
              <span>Trusted by fast-growing engineering organizations worldwide.</span>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────
          TRUSTED COMPANIES SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/20 py-10 overflow-hidden">
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-6">
            Helping Job Seekers Join Forward-Thinking Scaleups
          </p>
          <div className="relative w-full flex items-center">
            {/* Infinite Horizontal Logo Scroll Marquee */}
            <div className="flex gap-16 animate-marquee whitespace-nowrap text-xl font-bold font-heading tracking-tight text-muted-foreground/60 select-none">
              {["Linear", "Vercel", "Stripe", "Supabase", "Notion", "Figma", "Retool", "Resend"].map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <span className="text-2xl font-black text-foreground">✦</span>
                  {brand}
                </div>
              ))}
              {/* Duplicate for infinite loop spacing */}
              {["Linear", "Vercel", "Stripe", "Supabase", "Notion", "Figma", "Retool", "Resend"].map((brand) => (
                <div key={`${brand}-dup`} className="flex items-center gap-2">
                  <span className="text-2xl font-black text-foreground">✦</span>
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────
          ADVANCED JOB SEARCH SECTION (INTERACTIVE)
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Interactive Job Match Search
            </h2>
            <p className="text-muted-foreground">
              Search roles, apply filters, and preview real-time compatibility matches.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Search Filter Controls Left */}
            <div className="lg:col-span-4 bg-card border rounded-2xl p-5 space-y-6 self-start shadow-md">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Filter className="size-4 text-primary" /> Filter Vacancies
              </h3>
              
              <div className="space-y-4">
                {/* Text query */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Keyword Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Title, company, or skills..."
                      className="w-full h-10 border bg-background rounded-lg pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
                    />
                  </div>
                </div>

                {/* Department drop tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Department Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Engineering", "Design", "Product", "Marketing"].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSearchDept(dept)}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium cursor-pointer",
                          searchDept === dept
                            ? "bg-primary border-primary text-primary-foreground font-semibold"
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remote option switch */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-foreground cursor-pointer" htmlFor="remote-opt">
                      Remote Work Only
                    </label>
                    <p className="text-[10px] text-muted-foreground">Show off-site/home roles</p>
                  </div>
                  <input
                    id="remote-opt"
                    type="checkbox"
                    checked={searchRemote}
                    onChange={(e) => setSearchRemote(e.target.checked)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Live Filter Results List Right */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  Showing {filteredJobs.length} active matching jobs
                </p>
                {(searchQuery || searchDept !== "All" || searchRemote) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchDept("All");
                      setSearchRemote(false);
                    }}
                    className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Clear Filter <X className="size-3" />
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.slice(0, visibleCount).map((job) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        key={job.id}
                        className="group border hover:border-primary/50 bg-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={cn("size-9 rounded-lg flex items-center justify-center font-bold text-sm", job.logoBg)}>
                              {job.company.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{job.title}</h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {job.company} • <MapPin className="size-3 inline" /> {job.location}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(job.tags as string[]).map((tag: string) => (
                              <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                              AI Match {job.matchScore}%
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">{job.salary}</span>
                          </div>
                          <Button size="sm" className="h-8 text-xs bg-primary" render={<Link href={`/dashboard/jobs`} />}>
                            Quick Apply
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border border-dashed rounded-xl py-12 text-center text-muted-foreground"
                    >
                      No open roles found matching your query criteria.
                    </motion.div>
                  )}
                </AnimatePresence>

                {filteredJobs.length > visibleCount && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleCount((prev) => prev + 3)}
                      className="gap-1.5 cursor-pointer border-primary/20 hover:border-primary/45 font-semibold"
                    >
                      View More Jobs <ChevronDown className="size-4 animate-bounce" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* ──────────────────────────────────────────────────────────
          FEATURED COMPANIES
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Featured Companies on TalentHub
            </h2>
            <p className="text-muted-foreground">
              Discover top organizations offering premium benefits, workspace cultures, and high-growth trajectories.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.slice(0, visibleCompaniesCount).map((company: MarketingCompany) => (
              <div
                key={company.name}
                className="group border bg-card rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("size-10 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br font-heading", company.logoColor)}>
                        {company.logoLetter}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{company.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="size-3 fill-amber-500 mr-0.5 inline" /> {company.rating}
                          </span>
                          • {company.activeJobs} active jobs
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t pt-4">
                  {(company.tags as string[]).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {companies.length > visibleCompaniesCount && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                onClick={() => setVisibleCompaniesCount((prev) => prev + 3)}
                className="font-semibold text-xs gap-1.5 cursor-pointer shadow-xs focus-ring h-10 px-5 border"
              >
                View More Companies <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────
          PLATFORM STATISTICS
          ────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/20 border-b">
        <Container>
          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 text-center">
            {[
              { label: "Talent Profile Matches", value: "340K+" },
              { label: "Average Time-to-Hire", value: "< 12 Days" },
              { label: "Successful Hires Joined", value: "48K+" },
              { label: "AI Screening Match Rate", value: "98.4%" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-gradient">
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────
          BENEFITS SECTION (BENTO GRID)
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b" id="features">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Built for Top Talent & High-Growth Companies
            </h2>
            <p className="text-muted-foreground">
              The ultimate tech job board replacing outdated resume matching.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-6 lg:grid-cols-12">
            {/* Bento Cell 1 */}
            <div className="md:col-span-3 lg:col-span-4 border bg-card p-6 rounded-xl flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="size-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Brain className="size-4" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Instant Profile Compatibility</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Goes beyond simple keywords. Matches job seekers to roles based on coding expertise, experience alignment, and compensation criteria.
                </p>
              </div>
            </div>

            {/* Bento Cell 2 */}
            <div className="md:col-span-3 lg:col-span-8 border bg-card p-6 rounded-xl flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="size-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Clock className="size-4" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Direct Application Pipelines</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apply with verified profile credentials in a single click. Keep hiring teams updated with clear communication channels and zero agency middlemen.
                </p>
              </div>
            </div>

            {/* Bento Cell 3 */}
            <div className="md:col-span-3 lg:col-span-8 border bg-card p-6 rounded-xl flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="size-4" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Salary & Benefits Transparency</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Access verified wage bands, company structures, and remote work flexibility metrics on every listing before you apply.
                </p>
              </div>
            </div>

            {/* Bento Cell 4 */}
            <div className="md:col-span-3 lg:col-span-4 border bg-card p-6 rounded-xl flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="size-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Shield className="size-4" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">AI Resume Optimizer</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluate your resume compatibility against job specifications in real-time to optimize your application alignment.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>





      {/* ──────────────────────────────────────────────────────────
          TESTIMONIALS SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Loved by Tech Teams & Job Seekers
            </h2>
            <p className="text-muted-foreground">
              Here is how modern engineering organizations and tech professionals build careers using TalentHub.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "TalentHub connects us with exceptionally well-aligned developers immediately. Our tech posting response rates are unmatched.",
                author: "Sarah Jenkins",
                role: "VP of People, Linear",
                avatarInitials: "SJ",
              },
              {
                quote: "Applying to jobs via TalentHub was so smooth. I loved seeing my compatibility metrics and got an interview request within 24 hours.",
                author: "David Chen",
                role: "Senior Frontend Engineer",
                avatarInitials: "DC",
              },
              {
                quote: "Posting on TalentHub got our engineering roles directly in front of active, highly qualified developers. Best tech job board around.",
                author: "Michael K.",
                role: "Director of Engineering, Stripe",
                avatarInitials: "MK",
              },
            ].map((t) => (
              <div key={t.author} className="border bg-card p-6 rounded-xl flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {t.avatarInitials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.author}</h4>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────
          FAQ SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b">
        <Container size="md">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Clear answers to the most common questions about the TalentHub tech job board.
            </p>
          </div>

          <div className="border rounded-2xl bg-card overflow-hidden shadow-xs divide-y">
            {[
              {
                q: "How does the AI Compatibility Match Score work?",
                a: "Our AI engine parses skills, career experience, and alignment criteria from candidate portfolios, mapping them against requirements to generate a composite fit score.",
              },
              {
                q: "How can job seekers optimize their visibility to companies?",
                a: "By creating a verified profile and matching your resume, our AI highlights your credentials directly to engineering leaders looking for your specific stack.",
              },
              {
                q: "Is TalentHub free for job seekers?",
                a: "Yes. Searching and applying to roles on TalentHub is entirely free. Companies pay simple flat fees to post jobs and feature active listings.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="w-full">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold hover:bg-muted/40 transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", openFaq === idx && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="p-5 pt-0 text-xs leading-relaxed text-muted-foreground border-t bg-muted/10">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────
          CTA SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <Container size="md">
          <div className="relative rounded-3xl bg-linear-to-b from-card to-card/90 border p-10 sm:p-14 text-center overflow-hidden shadow-2xl flex flex-col items-center">
            {/* Background Spotlights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[70px] -z-10" />
            
            <div className="max-w-xl space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight">
                Find Your Next Career Move Today
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access the productivity of an AI-powered tech job search. Join thousands of engineers finding roles with TalentHub.
              </p>

              {/* Conversion email waitlist input */}
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-3">
                <input
                  type="email"
                  placeholder="Enter work email address..."
                  className="h-10 border bg-background rounded-lg px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background flex-1"
                />
                {session?.loggedIn ? (
                  <Button size="default" className="h-10 px-5 bg-primary" render={<Link href="/dashboard" />}>
                    Go to Dashboard <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button size="default" className="h-10 px-5 bg-primary" render={<Link href="/register" />}>
                    Start Free Trial <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                No credit card required. 14-day free trial. Cancel anytime.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
