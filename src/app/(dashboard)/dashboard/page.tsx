"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Bookmark,
  Briefcase,
  User,
  Users,
  Plus,
  Sliders,
  Sparkles,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { cn, formatDate } from "@/lib/utils";
import { getJobs, getApplicationsByUser, getAllApplications, getSavedJobsByUser } from "@/lib/supabase/data-access";
import type { JobRow, CompanyRow, ApplicationRow } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateString);
}

// --- MOCK RECENT APPLICATIONS & RECOMMENDATIONS ---

const MOCK_INTERVIEWS = [
  {
    id: "int-1",
    role: "Technical Interview (React/Next.js)",
    company: "Linear",
    date: "July 12, 2026",
    time: "10:00 AM - 11:00 AM EST",
    interviewer: "Sarah Jenkins (VP of People)",
  },
  {
    id: "int-2",
    role: "AI Architecture Alignment Session",
    company: "Aether AI",
    date: "July 15, 2026",
    time: "2:00 PM - 3:00 PM PST",
    interviewer: "Dr. Rivera (Lead Research Scientist)",
  },
];



interface DashboardApplication {
  id: string;
  role: string;
  company: string;
  appliedDate: string;
  status: string;
  statusColor: string;
  matchScore: number;
}

interface RecruiterPipeline {
  title: string;
  dept: string;
  count: number;
  match: number;
}

export default function CandidateDashboard() {
  const [role, setRole] = useState<"candidate" | "recruiter" | null>(null);
  const [sessionName, setSessionName] = useState("Jordan");
  const [appliedCount, setAppliedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [userApplications, setUserApplications] = useState<DashboardApplication[]>([]);
  
  // Recruiter dynamic dashboard data
  const [recruiterJobsCount, setRecruiterJobsCount] = useState(0);
  const [recruiterCandidatesCount, setRecruiterCandidatesCount] = useState(0);
  const [recruiterPipelines, setRecruiterPipelines] = useState<RecruiterPipeline[]>([]);
  const [recruiterActivities, setRecruiterActivities] = useState<{ text: string; time: string }[]>([]);
  const [candidateActivities, setCandidateActivities] = useState<{ text: string; time: string }[]>([]);

  useEffect(() => {
    const rawSession = localStorage.getItem("talenthub-session");
    let email = "";
    if (rawSession) {
      const session = JSON.parse(rawSession);
      const userRole = session.role || "candidate";
      const userName = session.name || "Jordan";
      if (session.email) {
        email = session.email;
      }
      requestAnimationFrame(() => {
        setRole(userRole);
        setSessionName(userName);
      });
    } else {
      requestAnimationFrame(() => {
        setRole("candidate");
      });
    }

    async function loadDashboardData() {
      try {
        let rawCandidateAppActivities: { text: string; date: Date }[] = [];
        let rawCandidateSavedActivities: { text: string; date: Date }[] = [];
        let rawCandidateRegActivities: { text: string; date: Date }[] = [];

        if (email) {
          // Load candidate-specific stats and applications
          const { data: dbApps } = await getApplicationsByUser(email);
          if (dbApps) {
            setUserApplications(
              dbApps.map((app: ApplicationRow & { job?: (JobRow & { company?: CompanyRow | null }) | null }) => ({
                id: app.id,
                role: app.job?.title || "Role",
                company: app.job?.company?.name || "Company",
                appliedDate: app.created_at.split("T")[0],
                status: app.status || "Applied",
                statusColor:
                  app.status === "Interview"
                    ? "bg-purple-500"
                    : app.status === "Screening"
                    ? "bg-yellow-500"
                    : "bg-blue-500",
                matchScore: app.match_score || 90,
              }))
            );
            setAppliedCount(dbApps.length);

            // Populate candidate application activities
            rawCandidateAppActivities = dbApps.map((app) => ({
              text: `Applied for ${app.job?.title || 'Unknown Role'} at ${app.job?.company?.name || 'Unknown Company'}`,
              date: new Date(app.created_at)
            }));
          }

          const { data: dbSaved } = await getSavedJobsByUser(email);
          if (dbSaved) {
            setSavedCount(dbSaved.length);
          }

          // Populate candidate saved job activities
          const { data: rawSaved } = await supabase
            .from("saved_jobs")
            .select("created_at, job:jobs(title, company:companies(name))")
            .eq("user_email", email);
          
          if (rawSaved) {
            rawCandidateSavedActivities = (rawSaved as unknown as { created_at: string; job: { title: string; company: { name: string } } }[]).map((sj) => ({
              text: `Saved job listing ${sj.job?.title || 'Unknown Role'} at ${sj.job?.company?.name || 'Unknown Company'}`,
              date: new Date(sj.created_at)
            }));
          }

          // Populate registration activity
          const { data: profile } = await supabase
            .from("profiles")
            .select("created_at")
            .eq("email", email)
            .maybeSingle();

          if (profile?.created_at) {
            rawCandidateRegActivities = [{
              text: "Registered account profile on TalentHub",
              date: new Date(profile.created_at)
            }];
          }
        } else {
          // Fallback to local storage
          const applied = localStorage.getItem("talenthub-applied-jobs");
          if (applied) {
            setAppliedCount(JSON.parse(applied).length);
          }
          const saved = localStorage.getItem("talenthub-saved-jobs");
          if (saved) {
            setSavedCount(JSON.parse(saved).length);
          }
        }

        // Build Candidate activity timeline
        const sortedRawCandidate = [...rawCandidateAppActivities, ...rawCandidateSavedActivities, ...rawCandidateRegActivities]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 4)
          .map(act => ({
            text: act.text,
            time: getRelativeTime(act.date.toISOString())
          }));
        
        if (sortedRawCandidate.length === 0) {
          setCandidateActivities([
            { text: "Registered account profile on TalentHub", time: "just now" }
          ]);
        } else {
          setCandidateActivities(sortedRawCandidate);
        }

        // Load recruiter command center stats & pipelines filtered by publisher_email
        const { data: allJobs } = await getJobs();
        const { data: allApps } = await getAllApplications();

        const myJobs = allJobs ? (allJobs as (JobRow & { publisher_email?: string })[]).filter((job) => job.publisher_email === email) : [];
        const myJobIds = myJobs.map((j) => j.id);
        const myApps = allApps ? (allApps as (ApplicationRow & { job?: (JobRow & { publisher_email?: string }) | null })[]).filter((app) => myJobIds.includes(app.job_id)) : [];

        setRecruiterJobsCount(myJobs.length);
        setRecruiterCandidatesCount(myApps.length);

        if (myJobs.length > 0) {
          // Build pipeline candidate counters
          const pipelines = myJobs.map((job) => {
            const applicantsCount = myApps.filter((app) => app.job_id === job.id).length;
            return {
              title: job.title,
              dept: job.department,
              count: applicantsCount,
              match: job.match_score || 90,
            };
          });
          setRecruiterPipelines(pipelines.slice(0, 4));
        } else {
          setRecruiterPipelines([]);
        }

        // Build Recruiter activities
        const rawRecruiterAppActivities = myApps.map((app) => ({
          text: `${app.user_name || 'A candidate'} applied for ${app.job?.title || 'Unknown Role'}`,
          date: new Date(app.created_at)
        }));
        const rawRecruiterJobActivities = myJobs.map((job) => ({
          text: `Posted new vacancy for ${job.title}`,
          date: new Date(job.posted_at)
        }));
        const sortedRawRecruiter = [...rawRecruiterAppActivities, ...rawRecruiterJobActivities]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 4)
          .map(act => ({
            text: act.text,
            time: getRelativeTime(act.date.toISOString())
          }));

        if (sortedRawRecruiter.length === 0) {
          setRecruiterActivities([
            { text: "No recent activity on your job posts yet", time: "just now" }
          ]);
        } else {
          setRecruiterActivities(sortedRawRecruiter);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      }
    }

    loadDashboardData();
  }, []);

  useEffect(() => {
    const syncSessionName = () => {
      const raw = localStorage.getItem("talenthub-session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) setSessionName(parsed.name);
      }
    };
    window.addEventListener("storage", syncSessionName);
    return () => {
      window.removeEventListener("storage", syncSessionName);
    };
  }, []);

  // --- UPLOAD STATE ---
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "parsing" | "parsed">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  
  // Dynamic Score State (animates post-upload)
  const [resumeScore, setResumeScore] = useState(0);
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);

  // Resume upload drag actions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateResumeProcessing(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateResumeProcessing(e.target.files[0].name);
    }
  };

  // Simulate file upload progress & AI scanning
  const simulateResumeProcessing = (name: string) => {
    setFileName(name);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Progress bar tick
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setUploadStatus("parsing");
          
          // Parse simulation timer
          setTimeout(() => {
            setUploadStatus("parsed");
            setIsScoreAnimating(true);
          }, 1200);

          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Animate the Resume Score gauge once parsed
  useEffect(() => {
    if (isScoreAnimating) {
      const scoreInterval = setInterval(() => {
        setResumeScore((prev) => {
          if (prev >= 92) {
            clearInterval(scoreInterval);
            setIsScoreAnimating(false);
            return 92;
          }
          return prev + 2;
        });
      }, 20);
      return () => clearInterval(scoreInterval);
    }
  }, [isScoreAnimating]);

  if (role === "recruiter") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Recruiter Command Center"
          description={`Welcome back, ${sessionName}. Manage open roles, search candidates, and track applicants funnel pipeline.`}
          actionLabel="Create New Job"
          actionHref="/dashboard/jobs/create"
          actionIcon={Plus}
        />

        {/* Key Metric Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Job Listings", value: `${recruiterJobsCount} Roles`, desc: "Live postings in database", icon: Briefcase },
            { label: "Total Candidates", value: `${recruiterCandidatesCount} Applicants`, desc: "Active candidate profiles", icon: Users },
            { label: "Interviews Scheduled", value: "6 Today", desc: "Next starting at 2 PM", icon: Calendar },
            { label: "Average Match Index", value: "86% ATS Score", desc: "High compatibility index", icon: Sparkles },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                  <p className="text-[10px] text-muted-foreground">{stat.desc}</p>
                </div>
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <stat.icon className="size-4.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workspace Columns */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Recent Applicants */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-sm flex items-center gap-1.5">
                      <Users className="size-4 text-primary" /> Active Job Pipelines
                    </span>
                    <p className="text-[10px] text-muted-foreground">Listings overview and active applicant counts</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" render={<Link href="/dashboard/candidates" />}>
                    View Candidates Pipeline
                  </Button>
                </div>

                <div className="divide-y">
                  {recruiterPipelines.length > 0 ? (
                    recruiterPipelines.map((job, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm text-foreground">{job.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{job.dept}</span>
                            <span>•</span>
                            <span className="text-primary font-medium">{job.count} applicants</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                          {job.match}% Avg Fit
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-muted-foreground font-semibold text-xs">
                      No open positions found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <span className="font-semibold text-sm block border-b pb-2">Employer Actions</span>
                <div className="grid gap-2">
                  <Button className="w-full justify-start text-xs h-9 gap-2" render={<Link href="/dashboard/jobs/create" />}>
                    <Plus className="size-4" /> Post a New Vacancy
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs h-9 gap-2" render={<Link href="/dashboard/candidates" />}>
                    <Search className="size-4" /> Find Candidates
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs h-9 gap-2" render={<Link href="/dashboard/analytics" />}>
                    <TrendingUp className="size-4" /> View Funnel Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recruiter Activity Log */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <span className="font-semibold text-sm block border-b pb-2">Recruitment Activity</span>
                <div className="space-y-3.5">
                  {recruiterActivities.map((act, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs text-foreground leading-snug">{act.text}</p>
                      <span className="text-[10px] text-muted-foreground block">{act.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <PageHeader
        title="Candidate Hub"
        description={`Welcome back, ${sessionName}. Review active applications, check calendar screens, and scan resume score matches.`}
        actionLabel="Find Jobs"
        actionHref="/dashboard/jobs"
        actionIcon={Briefcase}
      />

      {/* Key Metric Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Submitted Applications", value: `${appliedCount} Active`, desc: "Tracked vacancies status", icon: Briefcase },
          { label: "Bookmarked Roles", value: `${savedCount} Saved`, desc: "View in saved jobs tab", icon: Bookmark },
          { label: "Upcoming Interviews", value: "2 Scheduled", desc: "Next on July 12", icon: Calendar },
          { label: "AI Recommendations", value: "8 Matches", desc: "90%+ match index rating", icon: Sparkles },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                <p className="text-[10px] text-muted-foreground">{stat.desc}</p>
              </div>
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <stat.icon className="size-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Three-Column Workspace Layout (Main / Sidebar) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: UPLOAD, APPLICATIONS & CHARTS (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* MONOCHROMATIC APPLICATIONS VISUALIZER CHART (STRIPE STYLE) */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-primary" /> Application Pipeline Insights
                  </span>
                  <p className="text-[10px] text-muted-foreground">Profile views and applications metrics tracking (Last 7 Days)</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold">Monochromatic View</Badge>
              </div>

              {/* Stripe-style crisp vector line chart */}
              <div className="h-44 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />
                  <line x1="0" y1="12" x2="100" y2="12" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />
                  <line x1="0" y1="24" x2="100" y2="24" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />
                  <line x1="0" y1="35" x2="100" y2="35" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />

                  {/* Gradient Area under line */}
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00DF89" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00DF89" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 35 L 0 25 L 16 12 L 32 28 L 48 8 L 64 19 L 80 5 L 100 15 L 100 35 Z" fill="url(#chart-glow)" />

                  {/* Crisp Chart Vector Path */}
                  <path
                    d="M 0 25 L 16 12 L 32 28 L 48 8 L 64 19 L 80 5 L 100 15"
                    fill="none"
                    stroke="#00DF89"
                    strokeWidth="0.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Active node dot indicator */}
                  <circle cx="80" cy="5" r="0.75" fill="#00DF89" className="animate-pulse" />
                </svg>

                {/* Day Labels */}
                <div className="flex justify-between text-[9px] text-muted-foreground pt-1.5 font-semibold font-mono">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DYNAMIC RESUME UPLOADER CARD */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <UploadCloud className="size-4.5 text-primary" /> Resume Optimization Index
                </h4>
                <p className="text-[10px] text-muted-foreground">Scan your resume credentials using TalentHub AI to map role alignment matches.</p>
              </div>

              {/* Upload Drop Zone UI */}
              {uploadStatus === "idle" && (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "border border-dashed hover:border-primary/50 transition-colors rounded-xl py-10 px-6 text-center space-y-3 cursor-pointer bg-muted/20 relative",
                    dragActive && "border-primary bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <UploadCloud className="size-5.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">Drag & drop your resume file here</p>
                    <p className="text-[10px] text-muted-foreground">Supports PDF, DOCX formats up to 5MB</p>
                  </div>
                </div>
              )}

              {/* Uploading progress tracker */}
              {uploadStatus === "uploading" && (
                <div className="border rounded-xl p-5 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2"><FileText className="size-4 text-primary" /> {fileName}</span>
                    <span className="text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )}

              {/* AI Parsing screen */}
              {uploadStatus === "parsing" && (
                <div className="border rounded-xl p-6 text-center space-y-3 bg-muted/20 flex flex-col items-center">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">TalentHub AI analyzing resume...</p>
                    <p className="text-[10px] text-muted-foreground">Extracting expertise tags, career history milestones, and match vectors.</p>
                  </div>
                </div>
              )}

              {/* Successfully Parsed Output */}
              {uploadStatus === "parsed" && (
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-400" /> Resume Optimizations Verified
                    </h5>
                    <p className="text-[10px] text-muted-foreground">AI parsed 8 engineering tags. Compatibility score has been updated.</p>
                  </div>
                  <Button variant="outline" className="text-xs h-8 border-emerald-500/20 text-emerald-400 cursor-pointer" onClick={() => setUploadStatus("idle")}>
                    Re-upload
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ACTIVE APPLICATIONS TABLE */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <Briefcase className="size-4.5 text-primary" /> Active Job Applications
                </span>
                <Link href="/dashboard/jobs" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                  Search More Roles <ChevronRight className="size-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="pb-2.5">Company & Role</th>
                      <th className="pb-2.5">Date Submitted</th>
                      <th className="pb-2.5">AI Match</th>
                      <th className="pb-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {userApplications.length > 0 ? (
                      userApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 font-semibold text-foreground">
                            <div>{app.role}</div>
                            <div className="text-[10px] text-muted-foreground">{app.company}</div>
                          </td>
                          <td className="py-3 text-muted-foreground">{formatDate(app.appliedDate)}</td>
                          <td className="py-3 font-semibold text-primary">{app.matchScore}% Match</td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase">
                              <span className={cn("size-2 rounded-full", app.statusColor)} />
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground font-semibold">
                          No active applications found. Explore jobs and apply to see them here!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: SIDEBAR METRICS, CALENDAR, TIMELINE (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          
          {/* PROFILE COMPLETION WIDGET */}
          <Card>
            <CardContent className="p-4 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between border-b pb-2">
                <span>Profile Completion</span>
                <span className="text-primary font-bold">80%</span>
              </h4>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="w-[80%] h-full bg-primary" />
              </div>
              <div className="space-y-2 text-[10px] text-muted-foreground font-medium">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-400" /> Resume uploaded
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-400" /> Standard contact email verified
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full border flex items-center justify-center font-bold text-[8px]">+</span> Add portfolio link (+20%)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DYNAMIC RESUME SCORE CIRCULAR GAUGE */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <Sliders className="size-3.5" /> AI Resume Score
              </h4>

              <div className="flex items-center gap-4">
                {/* Gauge ring */}
                <div className="relative size-16 flex items-center justify-center shrink-0">
                  <svg className="size-full" viewBox="0 0 36 36">
                    <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-400 transition-all duration-300" strokeWidth="3.2" strokeDasharray={`${resumeScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xs font-bold font-mono">{resumeScore}%</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-bold">
                    {resumeScore === 0 ? "Upload Resume to Score" : resumeScore >= 90 ? "Excellent Fit Score" : "Needs Optimizations"}
                  </h5>
                  <p className="text-[10px] text-muted-foreground">
                    {resumeScore === 0
                      ? "Get structural scoring alignment recommendations."
                      : "Your parsed experience indicators show superior fit indices matches."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* INTERVIEWS CALENDAR / AGENDA WIDGET */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <Calendar className="size-3.5" /> Upcoming Screenings
              </h4>
              <div className="space-y-3">
                {MOCK_INTERVIEWS.map((interview) => (
                  <div key={interview.id} className="border bg-muted/20 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-primary truncate">{interview.company}</span>
                      <Badge variant="outline" className="text-[8px] font-bold py-0 h-4">INTERVIEW</Badge>
                    </div>
                    <div className="space-y-1 text-[10px] text-muted-foreground">
                      <p className="font-semibold text-foreground">{interview.role}</p>
                      <p className="flex items-center gap-1"><Clock className="size-3" /> {interview.date} at {interview.time}</p>
                      <p className="flex items-center gap-1"><User className="size-3" /> Host: {interview.interviewer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ACTIVITY TIMELINE CHRONOLOGICAL FEED */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <Clock className="size-3.5" /> Activity Timeline
              </h4>
              <div className="space-y-4 relative pl-3.5 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                {candidateActivities.map((activity, idx) => (
                  <div key={idx} className="space-y-0.5 text-[10px] relative">
                    <span className="absolute -left-[13.5px] top-1 size-1.5 rounded-full bg-primary" />
                    <p className="font-semibold text-foreground leading-normal">{activity.text}</p>
                    <span className="text-[9px] text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
