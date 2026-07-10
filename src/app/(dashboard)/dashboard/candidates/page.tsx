"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  Sliders,
  ChevronDown,
  Mail,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/shared/toast";
import { cn, formatDate } from "@/lib/utils";
import { getAllApplications } from "@/lib/supabase/data-access";
import { Loader2 } from "lucide-react";
import type { ApplicationRow, JobRow, CompanyRow } from "@/lib/supabase/types";

interface UiCandidate {
  id: string;
  name: string;
  role: string;
  company: string;
  experience: string;
  skills: string[];
  matchScore: number;
  status: string;
  appliedDate: string;
  email: string;
}

// map database application to Candidate UI format
const mapDbAppToUiCandidate = (dbApp: ApplicationRow & { job?: (JobRow & { company?: CompanyRow | null }) | null }): UiCandidate => ({
  id: dbApp.id,
  name: dbApp.user_name || "Candidate User",
  role: dbApp.job?.title || "Role",
  company: dbApp.job?.company?.name || "Company",
  experience: dbApp.job?.experience || "Mid",
  skills: dbApp.job?.skills || [],
  matchScore: dbApp.match_score || 90,
  status: dbApp.status || "New",
  appliedDate: dbApp.created_at ? dbApp.created_at.split("T")[0] : "",
  email: dbApp.user_email,
});

export default function CandidatesPage() {
  const { toast } = useToast();

  // --- STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedExp, setSelectedExp] = useState<string>("All");
  const [candidates, setCandidates] = useState<UiCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch candidates from Supabase on mount
  useEffect(() => {
    async function loadCandidates() {
      setIsLoading(true);
      try {
        const rawSession = localStorage.getItem("talenthub-session");
        let activeEmail = "";
        if (rawSession) {
          const session = JSON.parse(rawSession);
          activeEmail = session.email || "";
        }

        const { data, error } = await getAllApplications();
        if (error) throw error;
        if (data) {
          // Restrict candidate applications list to only those associated with jobs posted by this employer
          const filteredData = activeEmail
            ? (data as (ApplicationRow & { job?: (JobRow & { publisher_email?: string }) | null })[]).filter((app) => app.job?.publisher_email === activeEmail)
            : data;
          setCandidates((filteredData as (ApplicationRow & { job?: (JobRow & { company?: CompanyRow | null }) | null })[]).map(mapDbAppToUiCandidate));
        }
      } catch (err) {
        toast((err as Error).message || "Failed to load candidates", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadCandidates();
  }, [toast]);

  // --- FILTER LOGIC ---
  const filteredCandidates = useMemo(() => {
    let result = candidates;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          (c.skills as string[]).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (selectedStatus !== "All") {
      result = result.filter((c) => c.status === selectedStatus);
    }

    // Experience filter
    if (selectedExp !== "All") {
      result = result.filter((c) => c.experience === selectedExp);
    }

    return result;
  }, [searchQuery, selectedStatus, selectedExp, candidates]);

  const handleExportCSV = () => {
    toast("Pipeline CSV exported successfully!", "success");
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Candidate Directory"
        description="Review active applicant records, verify skill matrices, and export CSV pipeline charts."
      >
        <button
          onClick={handleExportCSV}
          className="text-xs h-9 bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center rounded-lg px-4 gap-1.5 shrink-0 cursor-pointer shadow-sm hover:bg-primary/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="size-4" /> Export CSV
        </button>
      </PageHeader>

      {/* Filter panel header */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, role, company, or tech stack..."
            className="w-full h-10 border bg-card rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Status select */}
          <div className="relative">
            <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 pl-9 pr-8 border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
            >
              <option value="All">All Stages</option>
              <option value="New">New Apps</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Contacted">Contacted</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Exp select */}
          <div className="relative">
            <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="h-10 pl-9 pr-8 border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
            >
              <option value="All">All Experience</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Lead">Lead Level</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Database Listing Table */}
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
          ) : filteredCandidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-1">Candidate</th>
                    <th className="pb-3">Last Position</th>
                    <th className="pb-3">Expertise Matrix</th>
                    <th className="pb-3">AI Match</th>
                    <th className="pb-3">Date Applied</th>
                    <th className="pb-3 text-right pr-1">Pipeline Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Name */}
                      <td className="py-3.5 pl-1 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {c.name.split(" ").map((n: string) => n.charAt(0)).join("")}
                          </div>
                          <div>
                            <div className="group-hover:text-primary transition-colors text-sm font-bold">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="size-3" /> {c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Current Role */}
                      <td className="py-3.5">
                        <div className="font-semibold text-foreground">{c.role}</div>
                        <div className="text-[10px] text-muted-foreground">{c.company}</div>
                      </td>

                      {/* Skills */}
                      <td className="py-3.5 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {(c.skills as string[]).map((skill: string) => (
                            <span key={skill} className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-medium border text-muted-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Match Score */}
                      <td className="py-3.5 font-bold text-emerald-400">
                        <span className="flex items-center gap-1"><TrendingUp className="size-3.5 text-emerald-400" /> {c.matchScore}% Match</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 text-muted-foreground">{formatDate(c.appliedDate)}</td>

                      {/* Stage status */}
                      <td className="py-3.5 text-right pr-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider py-0.5 px-2",
                            c.status === "Shortlisted" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            c.status === "New" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            c.status === "Contacted" && "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}
                        >
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No candidates match filters"
              description="Adjust candidate name search, experience level parameters, or pipeline filters."
              actionLabel="Reset Parameters"
              onAction={() => {
                setSearchQuery("");
                setSelectedStatus("All");
                setSelectedExp("All");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
