"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Sliders,
  Grid,
  List,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  X,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/shared/toast";

import { getJobs, applyToJob as apiApplyToJob, toggleSaveJob as apiToggleSaveJob, getSavedJobsByUser, getApplicationsByUser } from "@/lib/supabase/data-access";
import type { JobRow, CompanyRow } from "@/lib/supabase/types";

export interface UiJob {
  id: string;
  title: string;
  company: string;
  logoBg: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  department: string;
  experience: string;
  skills: string[];
  matchScore: number;
  postedAt: string;
  description: string;
  responsibilities: string[];
  benefits: string[];
  aiSummary: string;
  missingSkills: string[];
  companyRating: number;
  companySize: string;
  companyWebsite: string;
  companyIndustry: string;
}

// map database job to UI format
const mapDbJobToUiJob = (dbJob: JobRow & { company?: CompanyRow | null }): UiJob => ({
  id: dbJob.id,
  title: dbJob.title,
  company: dbJob.company?.name || "Unknown Company",
  logoBg: dbJob.company?.logo_bg || "bg-neutral-900 text-white",
  location: dbJob.location,
  type: dbJob.type,
  salaryMin: dbJob.salary_min,
  salaryMax: dbJob.salary_max,
  department: dbJob.department,
  experience: dbJob.experience,
  skills: dbJob.skills || [],
  matchScore: dbJob.match_score || 90,
  postedAt: dbJob.posted_at,
  description: dbJob.description,
  // Detailed fields
  responsibilities: dbJob.responsibilities || [],
  benefits: dbJob.benefits || [],
  aiSummary: dbJob.ai_summary || "",
  missingSkills: dbJob.missing_skills || [],
  companyRating: dbJob.company?.rating || 4.5,
  companySize: dbJob.company?.size || "50-100",
  companyWebsite: dbJob.company?.website || "",
  companyIndustry: dbJob.company?.industry || "",
});

export default function JobDiscoveryPage() {
  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedExps, setSelectedExps] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxSalary, setMaxSalary] = useState<number>(300000);
  const [sortBy, setSortBy] = useState<string>("recent");

  // --- INTERACTION & LISTINGS STATES ---
  const { toast } = useToast();
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("list");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<UiJob[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<UiJob[]>([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState<UiJob | null>(null);
  
  // Tab control: "all" vs "saved"
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");

  // --- INFINITE SCROLL & LOADING STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // --- USER SESSION DETAILS ---
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Load saved and applied jobs from local storage & load jobs from Supabase
  useEffect(() => {
    const rawSession = localStorage.getItem("talenthub-session");
    let email = "";
    if (rawSession) {
      const session = JSON.parse(rawSession);
      const sessionEmail = session.email || "";
      const sessionName = session.name || "";
      requestAnimationFrame(() => {
        if (sessionEmail) setUserEmail(sessionEmail);
        if (sessionName) setUserName(sessionName);
      });
      email = sessionEmail;
    }

    async function loadUserDataAndJobs() {
      try {
        // Load jobs
        const { data: jobsData, error: jobsError } = await getJobs();
        if (jobsError) throw jobsError;
        if (jobsData) {
          setAllJobs(jobsData.map(mapDbJobToUiJob));
        }

        if (email) {
          // Sync saved jobs from DB
          const { data: dbSaved, error: savedError } = await getSavedJobsByUser(email);
          if (!savedError && dbSaved) {
            setSavedJobs(dbSaved);
          }

          // Sync applied jobs from DB
          const { data: dbApplied, error: appliedError } = await getApplicationsByUser(email);
          if (!appliedError && dbApplied) {
            setAppliedJobs(dbApplied.map((app) => app.job_id));
          }
        } else {
          // Fallback to local storage
          const saved = localStorage.getItem("talenthub-saved-jobs");
          if (saved) setSavedJobs(JSON.parse(saved));

          const applied = localStorage.getItem("talenthub-applied-jobs");
          if (applied) setAppliedJobs(JSON.parse(applied));
        }
      } catch (err) {
        toast((err as Error).message || "Failed to load jobs", "error");
      } finally {
        setIsInitialFetch(false);
      }
    }

    loadUserDataAndJobs();
  }, [toast]);

  // Sync saved jobs with database
  const toggleSaveJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userEmail) {
      try {
        const { saved, error } = await apiToggleSaveJob(userEmail, id);
        if (error) throw error;
        if (saved) {
          setSavedJobs((prev) => [...prev, id]);
          toast("Job saved to bookmarks!", "success");
        } else {
          setSavedJobs((prev) => prev.filter((savedId) => savedId !== id));
          toast("Job removed from bookmarks.", "info");
        }
      } catch (err) {
        toast((err as Error).message || "Failed to update bookmark status", "error");
      }
    } else {
      // Local storage fallback
      let updated;
      if (savedJobs.includes(id)) {
        updated = savedJobs.filter((savedId) => savedId !== id);
        toast("Job removed from bookmarks.", "info");
      } else {
        updated = [...savedJobs, id];
        toast("Job saved to bookmarks!", "success");
      }
      setSavedJobs(updated);
      localStorage.setItem("talenthub-saved-jobs", JSON.stringify(updated));
    }
  };

  const applyToJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userEmail) {
      try {
        const { error } = await apiApplyToJob(userEmail, userName || "Candidate User", id);
        if (error) throw error;
        setAppliedJobs((prev) => [...prev, id]);
        toast("Application submitted successfully!", "success");
      } catch (err) {
        toast((err as Error).message || "Failed to submit application", "error");
      }
    } else {
      // Local storage fallback
      if (!appliedJobs.includes(id)) {
        const updated = [...appliedJobs, id];
        setAppliedJobs(updated);
        localStorage.setItem("talenthub-applied-jobs", JSON.stringify(updated));
        toast("Application submitted successfully!", "success");
      }
    }
  };

  // Click on card: open modal details & log to recently viewed
  const handleViewJob = (job: UiJob) => {
    setSelectedJobDetails(job);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== job.id);
      return [job, ...filtered].slice(0, 4); // Keep last 4
    });
  };

  // Trigger loading skeletons during filter operations
  const triggerFilterLoader = () => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      if (active) setIsLoading(true);
    });
    const timer = setTimeout(() => {
      if (active) setIsLoading(false);
    }, 350);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  };

  useEffect(() => {
    const cleanup = triggerFilterLoader();
    return cleanup;
  }, [searchQuery, selectedDepts, selectedExps, selectedTypes, maxSalary, sortBy, activeTab]);

  // --- MULTI-FILTER COMPILATION ---
  const filteredJobs = useMemo(() => {
    let result = allJobs;

    // Seeker Tab toggle
    if (activeTab === "saved") {
      result = result.filter((job) => savedJobs.includes(job.id));
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          (job.skills as string[]).some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    // Departments
    if (selectedDepts.length > 0) {
      result = result.filter((job) => selectedDepts.includes(job.department));
    }

    // Experience level
    if (selectedExps.length > 0) {
      result = result.filter((job) => selectedExps.includes(job.experience));
    }

    // Workplace Modes (Remote, Hybrid, Onsite)
    if (selectedTypes.length > 0) {
      result = result.filter((job) => selectedTypes.includes(job.type));
    }

    // Max Salary Cap
    result = result.filter((job) => job.salaryMax <= maxSalary || job.salaryMin <= maxSalary);

    // Sorting
    if (sortBy === "recent") {
      result = [...result].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    } else if (sortBy === "match") {
      result = [...result].sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "salary") {
      result = [...result].sort((a, b) => b.salaryMax - a.salaryMax);
    }

    return result;
  }, [searchQuery, selectedDepts, selectedExps, selectedTypes, maxSalary, sortBy, activeTab, savedJobs, allJobs]);

  // Infinite Scroll mock loader
  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsLoading(false);
    }, 500);
  };

  const paginatedJobs = filteredJobs.slice(0, visibleCount);

  // Toggle helpers
  const handleToggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (list.includes(val)) {
      setList(list.filter((x) => x !== val));
    } else {
      setList([...list, val]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Discover Jobs"
        description="Search, filter, and apply to premium vacancies tailored to your technical credentials."
      >
        <div className="flex items-center gap-1.5 border rounded-lg p-0.5 bg-muted/40 shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer",
              activeTab === "all" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Roles
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={cn(
              "text-xs px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer",
              activeTab === "saved" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Saved ({savedJobs.length})
          </button>
        </div>
      </PageHeader>

      {/* Main Jobs Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: FILTERS (DESKTOP HIDDEN / VISIBLE SIDEBAR) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 self-start sticky top-20">
          <Card>
            <CardContent className="p-5 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="size-4 text-primary" /> Filter Options
                </span>
                {(selectedDepts.length > 0 || selectedExps.length > 0 || selectedTypes.length > 0 || maxSalary < 300000) && (
                  <button
                    onClick={() => {
                      setSelectedDepts([]);
                      setSelectedExps([]);
                      setSelectedTypes([]);
                      setMaxSalary(300000);
                    }}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Department Category */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Category</label>
                <div className="space-y-1.5">
                  {["Engineering", "Design", "Product", "Marketing"].map((dept) => (
                    <label key={dept} className="flex items-center gap-2 text-xs font-semibold text-foreground/85 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDepts.includes(dept)}
                        onChange={() => handleToggleFilter(selectedDepts, setSelectedDepts, dept)}
                        className="size-3.5 rounded accent-primary cursor-pointer"
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience level */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Experience</label>
                <div className="space-y-1.5">
                  {["Entry", "Mid", "Senior", "Lead", "Executive"].map((exp) => (
                    <label key={exp} className="flex items-center gap-2 text-xs font-semibold text-foreground/85 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExps.includes(exp)}
                        onChange={() => handleToggleFilter(selectedExps, setSelectedExps, exp)}
                        className="size-3.5 rounded accent-primary cursor-pointer"
                      />
                      {exp} Level
                    </label>
                  ))}
                </div>
              </div>

              {/* Workplace Remote Status */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Workplace</label>
                <div className="space-y-1.5">
                  {["Remote", "Hybrid", "Onsite"].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-xs font-semibold text-foreground/85 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleToggleFilter(selectedTypes, setSelectedTypes, type)}
                        className="size-3.5 rounded accent-primary cursor-pointer"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Slider */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Max Salary</span>
                  <span className="font-bold text-primary">{formatCurrency(maxSalary)}</span>
                </div>
                <input
                  type="range"
                  min="80000"
                  max="300000"
                  step="10000"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* SIDEBAR WIDGET: RECENTLY VIEWED */}
          {recentlyViewed.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                  <Eye className="size-3.5" /> Recently Viewed
                </h4>
                <div className="space-y-2.5">
                  {recentlyViewed.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleViewJob(job)}
                      className="group flex flex-col gap-0.5 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <h5 className="text-xs font-semibold group-hover:text-primary truncate">{job.title}</h5>
                      <span className="text-[10px] text-muted-foreground">{job.company} • {job.location}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        {/* RIGHT COLUMN: SEARCH + ACTIVE LISTINGS */}
        <div className="lg:col-span-9 space-y-4">
          {/* SEARCH & LAYOUT CONFIG BAR */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills, keywords, company..."
                className="w-full h-10 border bg-card rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Controls panel: Sort & layout */}
            <div className="flex items-center gap-2 justify-between sm:justify-start">
              {/* Mobile Filter toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden size-10"
              >
                <Filter className="size-4" />
              </Button>

              {/* Sort Select */}
              <div className="relative">
                <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 pl-9 pr-8 border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
                >
                  <option value="recent">Recent Posted</option>
                  <option value="match">Highest Match</option>
                  <option value="salary">Highest Salary</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Layout mode switcher */}
              <div className="flex items-center border rounded-lg bg-muted/40 p-0.5 h-10 shrink-0">
                <button
                  onClick={() => setLayoutMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors cursor-pointer",
                    layoutMode === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="size-4" />
                </button>
                <button
                  onClick={() => setLayoutMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors cursor-pointer",
                    layoutMode === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER BADGES */}
          {(selectedDepts.length > 0 || selectedExps.length > 0 || selectedTypes.length > 0 || maxSalary < 300000) && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>Active filters:</span>
              {selectedDepts.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 pr-1 font-semibold text-[10px]">
                  {d} <X className="size-2.5 cursor-pointer hover:text-foreground" onClick={() => handleToggleFilter(selectedDepts, setSelectedDepts, d)} />
                </Badge>
              ))}
              {selectedExps.map((e) => (
                <Badge key={e} variant="secondary" className="gap-1 pr-1 font-semibold text-[10px]">
                  {e} <X className="size-2.5 cursor-pointer hover:text-foreground" onClick={() => handleToggleFilter(selectedExps, setSelectedExps, e)} />
                </Badge>
              ))}
              {selectedTypes.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 pr-1 font-semibold text-[10px]">
                  {t} <X className="size-2.5 cursor-pointer hover:text-foreground" onClick={() => handleToggleFilter(selectedTypes, setSelectedTypes, t)} />
                </Badge>
              ))}
              {maxSalary < 300000 && (
                <Badge variant="secondary" className="gap-1 pr-1 font-semibold text-[10px]">
                  &lt; {formatCurrency(maxSalary)} <X className="size-2.5 cursor-pointer hover:text-foreground" onClick={() => setMaxSalary(300000)} />
                </Badge>
              )}
            </div>
          )}

          {/* JOB LISTINGS CARDS CONTAINER */}
          <div className="space-y-4">
            {(isLoading || isInitialFetch) ? (
              // Loading skeletons during load/filter
              <div className={cn("grid gap-4", layoutMode === "grid" ? "sm:grid-cols-2" : "grid-cols-1")}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-lg shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : paginatedJobs.length > 0 ? (
              <div className={cn("grid gap-4", layoutMode === "grid" ? "sm:grid-cols-2" : "grid-cols-1")}>
                <AnimatePresence mode="popLayout">
                  {paginatedJobs.map((job) => {
                    const isSaved = savedJobs.includes(job.id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        key={job.id}
                        onClick={() => handleViewJob(job)}
                        className={cn(
                          "group bg-card border rounded-xl hover:border-primary/50 cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:-translate-y-0.5",
                          layoutMode === "list" ? "p-5 md:flex-row md:items-center gap-4" : "p-5 h-full space-y-4"
                        )}
                      >
                        {/* Top Info */}
                        <div className="flex items-start gap-4">
                          <div className={cn("size-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 font-heading shadow-xs", job.logoBg)}>
                            {job.company.charAt(0)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{job.title}</h4>
                              <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] h-4.5 font-bold border-primary/10">
                                AI Match {job.matchScore}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {job.company} • {job.location}
                            </p>
                          </div>
                        </div>

                        {/* Mid Meta */}
                        <div className={cn("flex flex-wrap gap-1.5", layoutMode === "list" && "md:ml-auto")}>
                          <Badge variant="outline" className="text-[10px] font-semibold flex items-center gap-1">
                            <MapPin className="size-3" /> {job.type}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold flex items-center gap-1">
                            <Briefcase className="size-3" /> {job.experience} Level
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold flex items-center gap-1">
                            <DollarSign className="size-3" /> {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                          </Badge>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0">
                          <button
                            onClick={(e) => toggleSaveJob(job.id, e)}
                            className={cn(
                              "size-8 border rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-muted/50",
                              isSaved ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground"
                            )}
                          >
                            {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                          </button>
                          <Button size="sm" className="h-8 text-xs bg-primary flex-1 md:flex-none">
                            View Role
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                title="No matching jobs found"
                description="We couldn't find any job postings that match your search filters. Try adjusting your categories, experience levels, or keywords."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearchQuery("");
                  setSelectedDepts([]);
                  setSelectedExps([]);
                  setSelectedTypes([]);
                  setMaxSalary(300000);
                  setActiveTab("all");
                }}
              />
            )}
          </div>

          {/* INFINITE SCROLL / PAGINATION LOAD BUTTON */}
          {filteredJobs.length > visibleCount && !isLoading && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={handleLoadMore} className="gap-1.5 cursor-pointer">
                Load More Jobs <ChevronDown className="size-4 animate-bounce" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MOBILE SLIDE-OUT FILTER DRAWER
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Slide content container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-80 h-full bg-card border-l p-5 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <SlidersHorizontal className="size-4 text-primary" /> Filter Options
                  </span>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Category filters */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Category</label>
                  <div className="space-y-1.5">
                    {["Engineering", "Design", "Product", "Marketing"].map((dept) => (
                      <label key={dept} className="flex items-center gap-2 text-xs font-semibold text-foreground/85 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDepts.includes(dept)}
                          onChange={() => handleToggleFilter(selectedDepts, setSelectedDepts, dept)}
                          className="size-3.5 rounded accent-primary cursor-pointer"
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience filters */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Experience</label>
                  <div className="space-y-1.5">
                    {["Entry", "Mid", "Senior", "Lead", "Executive"].map((exp) => (
                      <label key={exp} className="flex items-center gap-2 text-xs font-semibold text-foreground/85 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedExps.includes(exp)}
                          onChange={() => handleToggleFilter(selectedExps, setSelectedExps, exp)}
                          className="size-3.5 rounded accent-primary cursor-pointer"
                        />
                        {exp} Level
                      </label>
                    ))}
                  </div>
                </div>

                {/* Workplace remote type filters */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Workplace</label>
                  <div className="space-y-1.5">
                    {["Remote", "Hybrid", "Onsite"].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-xs font-semibold text-foreground/85 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleToggleFilter(selectedTypes, setSelectedTypes, type)}
                          className="size-3.5 rounded accent-primary cursor-pointer"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Salary slider */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Max Salary</span>
                    <span className="font-bold text-primary">{formatCurrency(maxSalary)}</span>
                  </div>
                  <input
                    type="range"
                    min="80000"
                    max="300000"
                    step="10000"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => {
                  setSelectedDepts([]);
                  setSelectedExps([]);
                  setSelectedTypes([]);
                  setMaxSalary(300000);
                }}>
                  Reset All
                </Button>
                <Button className="flex-1 text-xs bg-primary" onClick={() => setIsMobileFiltersOpen(false)}>
                  Show Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────
          JOB DETAILS MOCK PREVIEW MODAL
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobDetails(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-card border rounded-2xl p-6 shadow-2xl space-y-6"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="absolute right-4 top-4 p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className={cn("size-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-heading shadow-md", selectedJobDetails.logoBg)}>
                  {selectedJobDetails.company.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg leading-snug">{selectedJobDetails.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedJobDetails.company} • {selectedJobDetails.location}
                  </p>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <TrendingUp className="size-4 text-primary" /> AI Match Level: {selectedJobDetails.matchScore}%
                  </div>
                  <p className="text-[10px] text-muted-foreground">This role aligns closely with your saved profile credentials.</p>
                </div>
                <Badge className="bg-primary text-primary-foreground font-bold">Excellent Fit</Badge>
              </div>

              {/* Metadata attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs border-y py-4">
                <div>
                  <span className="text-muted-foreground font-semibold">Compensation Range</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {formatCurrency(selectedJobDetails.salaryMin)} - {formatCurrency(selectedJobDetails.salaryMax)} / year
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Workplace Mode</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedJobDetails.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Experience Requirement</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedJobDetails.experience} Level</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Department</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedJobDetails.department}</p>
                </div>
              </div>

              {/* Description & skills */}
              <div className="space-y-3">
                <div>
                  <h5 className="font-semibold text-xs text-muted-foreground">Job Overview</h5>
                  <p className="text-xs text-foreground/80 leading-relaxed mt-1">{selectedJobDetails.description}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-muted-foreground">Required Expertise</h5>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(selectedJobDetails.skills as string[]).map((skill: string) => (
                      <span key={skill} className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium border text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center gap-2.5 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedJobDetails(null)}>
                  Close
                </Button>
                {appliedJobs.includes(selectedJobDetails.id) ? (
                  <Button disabled className="flex-1 bg-success/15 border border-success/35 text-success font-semibold gap-1 cursor-not-allowed select-none opacity-100 disabled:opacity-100">
                    <CheckCircle2 className="size-3.5 text-success" /> Applied
                  </Button>
                ) : (
                  <Button className="flex-1 bg-primary gap-1" onClick={(e) => applyToJob(selectedJobDetails.id, e)}>
                    Apply Now <ExternalLink className="size-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
