"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Brain,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/shared/toast";

import { getJobById, getJobs, applyToJob, toggleSaveJob, isJobSaved, getApplicationsByUser } from "@/lib/supabase/data-access";
import { Loader2 } from "lucide-react";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  // Resolve parameters using React.use
  const resolvedParams = React.use(params);
  const router = useRouter();

  const [job, setJob] = useState<UiJob | null>(null);
  const [similarJobs, setSimilarJobs] = useState<UiJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // --- STATE INTERACTIVES ---
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      setIsLoading(true);
      try {
        const { data, error } = await getJobById(resolvedParams.id);
        if (error) throw error;
        if (!data) {
          toast("Job posting not found", "error");
          router.push("/dashboard/jobs");
          return;
        }
        const uiJob = mapDbJobToUiJob(data);
        setJob(uiJob);

        // Fetch similar jobs
        const { data: allJobsData } = await getJobs();
        if (allJobsData) {
          const mapped = allJobsData.map(mapDbJobToUiJob);
          const filtered = mapped.filter((item) => item.id !== uiJob.id).slice(0, 2);
          setSimilarJobs(filtered);
        }
      } catch (err) {
        toast((err as Error).message || "Failed to load job details", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadJob();
  }, [resolvedParams.id, router, toast]);

  // --- USER SESSION DETAILS ---
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const rawSession = localStorage.getItem("talenthub-session");
    if (rawSession) {
      const session = JSON.parse(rawSession);
      const emailVal = session.email || "";
      const nameVal = session.name || "";
      requestAnimationFrame(() => {
        if (emailVal) setUserEmail(emailVal);
        if (nameVal) setUserName(nameVal);
      });
    }
  }, []);

  // Sync bookmark and apply status from Supabase (falling back to localStorage if offline or guest)
  useEffect(() => {
    if (!job) return;
    const jobId = job.id;

    async function checkStatus() {
      if (userEmail) {
        // Query Supabase
        const { saved } = await isJobSaved(userEmail, jobId);
        setIsSaved(saved);

        const { data: apps } = await getApplicationsByUser(userEmail);
        if (apps) {
          setIsApplied(apps.some((app) => app.job_id === jobId));
        }
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem("talenthub-saved-jobs");
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsSaved(parsed.includes(jobId));
        }

        const applied = localStorage.getItem("talenthub-applied-jobs");
        if (applied) {
          const parsed = JSON.parse(applied);
          setIsApplied(parsed.includes(jobId));
        }
      }
    }

    checkStatus();
  }, [job, userEmail]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) return null;

  const handleToggleSave = async () => {
    if (userEmail) {
      try {
        const { saved, error } = await toggleSaveJob(userEmail, job.id);
        if (error) throw error;
        setIsSaved(saved);
        if (saved) {
          toast("Job saved to bookmarks!", "success");
        } else {
          toast("Job removed from bookmarks.", "info");
        }
      } catch (err) {
        toast((err as Error).message || "Failed to update bookmark status", "error");
      }
    } else {
      // Local storage fallback
      const saved = localStorage.getItem("talenthub-saved-jobs");
      let parsed = saved ? JSON.parse(saved) : [];
      if (parsed.includes(job.id)) {
        parsed = parsed.filter((id: string) => id !== job.id);
        setIsSaved(false);
        toast("Job removed from bookmarks.", "info");
      } else {
        parsed.push(job.id);
        setIsSaved(true);
        toast("Job saved to bookmarks!", "success");
      }
      localStorage.setItem("talenthub-saved-jobs", JSON.stringify(parsed));
    }
  };

  const handleApply = async () => {
    if (userEmail) {
      try {
        const { error } = await applyToJob(userEmail, userName || "Candidate User", job.id);
        if (error) throw error;
        setIsApplied(true);
        toast("Application submitted successfully!", "success");
      } catch (err) {
        toast((err as Error).message || "Failed to submit application", "error");
      }
    } else {
      // Local storage fallback
      const applied = localStorage.getItem("talenthub-applied-jobs");
      const parsed = applied ? JSON.parse(applied) : [];
      if (!parsed.includes(job.id)) {
        parsed.push(job.id);
        setIsApplied(true);
        localStorage.setItem("talenthub-applied-jobs", JSON.stringify(parsed));
        toast("Application submitted successfully!", "success");
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard!", "success");
  };

  // similarJobs is loaded dynamically in the mount useEffect and stored in state.

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">

      {/* Back navigation link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/jobs")}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer focus-ring px-2.5 py-1.5 rounded-lg border bg-card shadow-2xs transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Job Discovery
        </button>
      </div>

      {/* Grid: Details main context & Sidebar sticky card */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: MAIN ROLE SPECIFICATION DETAILS (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Area */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn("size-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 font-heading shadow-md", job.logoBg)}>
                    {job.company.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-foreground">{job.title}</h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3" /> {job.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" /> Posted {formatDate(job.postedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-dashed pt-4">
                <Badge variant="outline" className="text-xs font-semibold py-1">
                  <Briefcase className="size-3.5 mr-1" /> {job.experience} Level
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold py-1">
                  <MapPin className="size-3.5 mr-1" /> {job.type}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold py-1">
                  <DollarSign className="size-3.5 mr-1" /> {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)} / year
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI MATCH INSPECTOR */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
            <CardContent className="p-6 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                <span className="font-semibold text-sm flex items-center gap-2 text-emerald-400">
                  <Brain className="size-4.5 text-emerald-400 animate-pulse" /> TalentHub AI Insight Match
                </span>
                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-neutral-950 font-bold border-none text-xs">
                  {job.matchScore}% Match Index
                </Badge>
              </div>

              {/* AI Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">AI Fit Summary</h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {job.aiSummary}
                </p>
              </div>

              {/* Skills breakdown comparisons */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {/* Matching Skills */}
                <div className="space-y-2 bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Aligned Expertise</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {job.skills.map((skill: string) => (
                      <span key={skill} className="text-[10px] bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold text-emerald-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-2 bg-red-950/10 border border-red-500/10 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Improvement Gaps</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {job.missingSkills.map((skill: string) => (
                      <span key={skill} className="text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-semibold text-red-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            </CardContent>
          </Card>

          {/* JOB CONTENT AND DESCRIPTION DETAILS */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Overview */}
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-sm text-foreground">Role Overview</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-3 pt-2">
                <h3 className="font-heading font-bold text-sm text-foreground">Core Responsibilities</h3>
                <div className="space-y-2.5">
                  {job.responsibilities.map((resp: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perks and Benefits */}
              <div className="space-y-3 pt-2">
                <h3 className="font-heading font-bold text-sm text-foreground">Compensation & Benefits</h3>
                <div className="space-y-2.5">
                  {job.benefits.map((benefit: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SIMILAR JOBS MATRIX PANEL */}
          <div className="space-y-3.5">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5 px-1">
              <TrendingUp className="size-4 text-primary" /> Similar Jobs For You
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {similarJobs.map((similar) => (
                <div
                  key={similar.id}
                  onClick={() => router.push(`/dashboard/jobs/${similar.id}`)}
                  className="group bg-card border rounded-xl p-4 flex flex-col justify-between gap-4 cursor-pointer hover:border-primary/50 transition-colors shadow-2xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-heading", similar.logoBg)}>
                        {similar.company.charAt(0)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-semibold text-xs truncate group-hover:text-primary transition-colors">{similar.title}</h4>
                        <span className="text-[10px] text-muted-foreground">{similar.company} • {similar.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] font-bold">
                      AI Match {similar.matchScore}%
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {formatCurrency(similar.salaryMin)} - {formatCurrency(similar.salaryMax)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY APPLY CARD & COMPANY SUMMARY CARD (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          
          {/* STICKY APPLY CARD */}
          <Card className="shadow-lg">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1 pb-3 border-b">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Compensation</span>
                <h3 className="text-xl font-bold text-foreground">
                  {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                  <span className="text-xs font-medium text-muted-foreground"> / year</span>
                </h3>
              </div>

              <div className="space-y-3">
                {isApplied ? (
                  <Button disabled className="w-full bg-success/15 border border-success/35 text-success font-semibold py-5 gap-1.5 cursor-not-allowed select-none opacity-100 disabled:opacity-100" size="default">
                    <CheckCircle2 className="size-4 text-success" /> Applied
                  </Button>
                ) : (
                  <Button onClick={handleApply} className="w-full bg-primary font-semibold py-5 gap-1.5 cursor-pointer" size="default">
                    Apply Now <ExternalLink className="size-4" />
                  </Button>
                )}

                <div className="flex gap-2">
                  {/* Bookmark Button */}
                  <Button
                    variant="outline"
                    onClick={handleToggleSave}
                    className={cn(
                      "flex-1 text-xs gap-1.5 h-10 border transition-colors cursor-pointer",
                      isSaved ? "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10" : ""
                    )}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="size-4" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="size-4" /> Save Job
                      </>
                    )}
                  </Button>

                  {/* Share button */}
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 text-xs gap-1.5 h-10 cursor-pointer"
                  >
                    <Share2 className="size-4" /> Share Role
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 border rounded-xl p-3 text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>• Apply once with your verified TalentHub profile credentials.</p>
                <p>• Company replies on average within 4 business days.</p>
              </div>
            </CardContent>
          </Card>

          {/* COMPANY INFORMATION CARD */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <Building className="size-3.5" /> Company Information
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Company Name</span>
                  <span className="font-semibold">{job.company}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rating score</span>
                  <span className="flex items-center gap-0.5 font-bold text-amber-500">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" /> {job.companyRating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="font-semibold">{job.companySize} employees</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Industry Group</span>
                  <span className="font-semibold">{job.companyIndustry}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground">Website</span>
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Visit Site <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
