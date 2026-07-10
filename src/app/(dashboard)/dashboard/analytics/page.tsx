"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Clock,
  Users,
  Award,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { getAllApplications } from "@/lib/supabase/data-access";
import type { ApplicationRow, JobRow } from "@/lib/supabase/types";

// --- MOCK DATA ---
const FUNNEL_METRICS = [
  { stage: "Sourced Candidates", count: 480, percentage: "100%" },
  { stage: "AI Profile Verified Fit", count: 242, percentage: "50.4%" },
  { stage: "Active Screening Scheduled", count: 120, percentage: "25.0%" },
  { stage: "Final Team Interviews", count: 48, percentage: "10.0%" },
  { stage: "Offers Formulated", count: 12, percentage: "2.5%" },
];

export default function AnalyticsPage() {
  const [funnelMetrics, setFunnelMetrics] = useState(FUNNEL_METRICS);
  const [placedCount, setPlacedCount] = useState(24);
  useEffect(() => {
    async function loadAnalytics() {
      try {
        const rawSession = localStorage.getItem("talenthub-session");
        let activeEmail = "";
        if (rawSession) {
          const session = JSON.parse(rawSession);
          activeEmail = session.email || "";
        }

        const { data: allApps } = await getAllApplications();
        if (allApps) {
          // Filter applications by active recruiter's email
          const filteredApps = activeEmail
            ? (allApps as (ApplicationRow & { job?: (JobRow & { publisher_email?: string }) | null })[]).filter((a) => a.job?.publisher_email === activeEmail)
            : allApps;

          const total = filteredApps.length;
          const fit = filteredApps.filter((a) => (a.match_score || 90) >= 90).length;
          const screening = filteredApps.filter((a) => a.status === "Screening").length;
          const interview = filteredApps.filter((a) => a.status === "Interview").length;
          const offers = filteredApps.filter((a) => a.status === "Offered" || a.status === "Hired").length;

          const formatPercent = (count: number, total: number) => {
            if (total === 0) return "0%";
            return `${((count / total) * 100).toFixed(1)}%`;
          };

          setFunnelMetrics([
            { stage: "Sourced Candidates", count: total, percentage: "100%" },
            { stage: "AI Profile Verified Fit", count: fit, percentage: formatPercent(fit, total) },
            { stage: "Active Screening Scheduled", count: screening, percentage: formatPercent(screening, total) },
            { stage: "Final Team Interviews", count: interview, percentage: formatPercent(interview, total) },
            { stage: "Offers Formulated", count: offers, percentage: formatPercent(offers, total) },
          ]);

          const placed = filteredApps.filter((a) => a.status === "Hired").length;
          setPlacedCount(placed > 0 ? placed : total); // Fallback to total if 0 hired
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Analytics"
        description="Monitor hiring pipelines velocity, check conversion indexes, and download CSV reports."
      />

      {/* Analytics stats card deck */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg Time-to-Hire", value: "9.2 Days", change: "-4.1 days", isPositive: true, icon: Clock },
          { label: "Offer Acceptance Index", value: "88.4%", change: "+2.1%", isPositive: true, icon: Percent },
          { label: "AI Screening Accuracy", value: "94.2%", change: "+0.8%", isPositive: true, icon: Award },
          { label: "Hired candidates", value: `${placedCount} placed`, change: "+4 this month", isPositive: true, icon: Users },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                <span className={cn(
                  "text-[9px] font-semibold flex items-center gap-0.5",
                  stat.isPositive ? "text-emerald-400" : "text-rose-400"
                )}>
                  {stat.change}
                </span>
              </div>
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <stat.icon className="size-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: HISTOGRAMS AND FUNNELS (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VOLUME OVER TIME MONOCHROMATIC HISTOGRAM (DESIGN_SYSTEM.md SPEC) */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-primary" /> Candidate Volume Velocity
                  </span>
                  <p className="text-[10px] text-muted-foreground">Monthly candidate profile logs across engineering vacancies (Last 6 Months)</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold">Volume Graph</Badge>
              </div>

              {/* Design System: Volume Over Time Histogram in text-muted (#52525B) and high peaks in white */}
              <div className="h-44 w-full relative pt-4 flex items-end justify-between gap-3 px-2">
                {[
                  { month: "Jan", count: 180, active: false },
                  { month: "Feb", count: 240, active: false },
                  { month: "Mar", count: 320, active: false },
                  { month: "Apr", count: 480, active: true }, // Peak (White)
                  { month: "May", count: 390, active: false },
                  { month: "Jun", count: 410, active: false },
                ].map((data, idx) => {
                  // Max count is 480 (height = 100%)
                  const heightPercent = (data.count / 480) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent - 15}%` }}
                        className={cn(
                          "w-full rounded-md transition-all duration-300",
                          data.active
                            ? "bg-foreground shadow-lg shadow-white/5" // High-volume peak in bright white
                            : "bg-[#2A2A2E] hover:bg-[#52525B]" // Standard elements in text-muted/border-muted color tokens
                        )}
                      />
                      {/* Label */}
                      <span className="text-[10px] font-bold font-mono text-muted-foreground">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* CONVERSION FUNNEL METRICS */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <Users className="size-4.5 text-primary" /> Application Funnel Analytics
                </h4>
                <p className="text-[10px] text-muted-foreground">Track percentage conversions at each screening milestone.</p>
              </div>

              <div className="space-y-3.5">
                {funnelMetrics.map((funnel, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{funnel.stage}</span>
                      <span className="text-muted-foreground font-mono">{funnel.count} ({funnel.percentage})</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        style={{ width: funnel.percentage }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: INSIGHTS & REPORTS (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                ⚡ Operational Highlights
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Next.js Roles are in high demand</span>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    React and TypeScript vacancies comprise over 60% of active applicant searches. Match scoring index indicates high-intent profiles.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Time-to-Hire reduced by 40%</span>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Automating resume parsing and scoring has speeded review timelines by an average of 4.1 days relative to manually screening directories.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Active Seat count meters</span>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Your Stripe organization context currently has 3 active seats in use (Sarah, Mike, Alex). Boost packages to access more team features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
