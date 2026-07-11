"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Video,
  Copy,
  Check,
  X,
  Loader2,
  CalendarRange,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/shared/toast";
import { getAllApplications } from "@/lib/supabase/data-access";
import type { ApplicationRow } from "@/lib/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  type: string;
  date: string;
  timeSlot: string;
  interviewer: string;
  meetingLink: string;
  status: "scheduled" | "completed" | "cancelled";
}

const INITIAL_MOCK_INTERVIEWS: Interview[] = [
  {
    id: "int-mock-1",
    candidateName: "Jordan Smith",
    candidateEmail: "jordan.smith@university.edu",
    role: "Technical Interview (React/Next.js)",
    type: "Technical Panel",
    date: "2026-07-12",
    timeSlot: "10:00 AM - 11:00 AM EST",
    interviewer: "Sarah Jenkins (VP of People)",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    status: "scheduled",
  },
  {
    id: "int-mock-2",
    candidateName: "Dr. Rivera Chen",
    candidateEmail: "rivera.chen@ai-institute.org",
    role: "AI Architecture Alignment Session",
    type: "System Design",
    date: "2026-07-15",
    timeSlot: "2:00 PM - 3:00 PM PST",
    interviewer: "Sarah Jenkins (VP of People)",
    meetingLink: "https://meet.google.com/xyz-uvwx-yza",
    status: "scheduled",
  },
];

export default function EmployerInterviewsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [role, setRole] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<{ name: string; email: string; role: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Scheduling Form States
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState<number | string>("");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState("Technical Panel");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const rawSession = localStorage.getItem("talenthub-session");
    if (rawSession) {
      const session = JSON.parse(rawSession);
      const userRole = session.role || "candidate";
      if (userRole !== "recruiter") {
        // Enforce role checks: redirect students away
        router.push("/dashboard");
        return;
      }
      requestAnimationFrame(() => {
        setRole(userRole);
      });
    } else {
      router.push("/login");
      return;
    }

    // Load interviews from localStorage
    const saved = localStorage.getItem("talenthub-interviews");
    if (saved) {
      const parsedSaved = JSON.parse(saved);
      requestAnimationFrame(() => {
        setInterviews(parsedSaved);
      });
    } else {
      localStorage.setItem("talenthub-interviews", JSON.stringify(INITIAL_MOCK_INTERVIEWS));
      requestAnimationFrame(() => {
        setInterviews(INITIAL_MOCK_INTERVIEWS);
      });
    }

    // Fetch Candidates from Applications
    async function loadCandidates() {
      try {
        const { data, error } = await getAllApplications();
        if (error) throw error;
        if (data) {
          // Map to drop-down candidate choices
          const list = (data as ApplicationRow[]).map((app) => ({
            name: app.user_name || "Applicant",
            email: app.user_email,
            role: app.job?.title || "Engineering Role",
          }));
          // Deduplicate by email
          const uniqueList = Array.from(new Map(list.map((c) => [c.email, c])).values());
          setCandidates(uniqueList);
        }
      } catch (err) {
        console.error("Failed to load candidate applications", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCandidates();
  }, [router]);

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast("Meeting invitation link copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (id: string, newStatus: "scheduled" | "completed" | "cancelled") => {
    const updated = interviews.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setInterviews(updated);
    localStorage.setItem("talenthub-interviews", JSON.stringify(updated));
    toast(`Interview status marked as ${newStatus}!`, "success");
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let candidateName = "";
    let candidateEmail = "";
    let roleName = "";

    if (selectedCandidateIdx === "custom") {
      if (!customName || !customEmail || !customRole) {
        toast("Please fill in candidate custom descriptors.", "error");
        return;
      }
      candidateName = customName;
      candidateEmail = customEmail;
      roleName = customRole;
    } else {
      const selected = candidates[Number(selectedCandidateIdx)];
      if (!selected) {
        toast("Please select a candidate.", "error");
        return;
      }
      candidateName = selected.name;
      candidateEmail = selected.email;
      roleName = selected.role;
    }

    if (!interviewDate || !interviewTime || !interviewerName) {
      toast("Please complete date, time, and interviewer details.", "error");
      return;
    }

    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      candidateName,
      candidateEmail,
      role: roleName,
      type: interviewType,
      date: interviewDate,
      timeSlot: interviewTime,
      interviewer: interviewerName,
      meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
      status: "scheduled",
    };

    const updated = [newInterview, ...interviews];
    setInterviews(updated);
    localStorage.setItem("talenthub-interviews", JSON.stringify(updated));

    // Reset Form
    setSelectedCandidateIdx("");
    setCustomName("");
    setCustomEmail("");
    setCustomRole("");
    setInterviewDate("");
    setInterviewTime("");
    setInterviewerName("");
    setIsDialogOpen(false);

    toast("Interview scheduled successfully!", "success");
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchStatus = item.status === activeTab;
      const matchSearch =
        item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [interviews, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const upcoming = interviews.filter((i) => i.status === "scheduled").length;
    const completed = interviews.filter((i) => i.status === "completed").length;
    const cancelled = interviews.filter((i) => i.status === "cancelled").length;
    return { upcoming, completed, cancelled };
  }, [interviews]);

  if (!role) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews Manager"
        description="Schedule technical assessments, HR screenings, and organize calendar links."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button size="sm" className="gap-1.5 cursor-pointer font-semibold shadow-sm">
              <Plus className="size-4" /> Schedule Interview
            </Button>
          } />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Assign screening parameters and calendar triggers for verified applicants.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Select Candidate</label>
                <select
                  value={selectedCandidateIdx}
                  onChange={(e) => setSelectedCandidateIdx(e.target.value)}
                  className="w-full h-10 px-3 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="">-- Choose from active applications --</option>
                  {candidates.map((cand, idx) => (
                    <option key={idx} value={idx}>
                      {cand.name} ({cand.role})
                    </option>
                  ))}
                  <option value="custom">-- Custom Name Input --</option>
                </select>
              </div>

              {selectedCandidateIdx === "custom" && (
                <div className="space-y-3.5 border p-3 rounded-lg bg-muted/20">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jordan Smith"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full h-9 px-3 border rounded-md text-xs bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. jordan@example.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full h-9 px-3 border rounded-md text-xs bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Role Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full h-9 px-3 border rounded-md text-xs bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Category</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  >
                    <option value="Technical Panel">Technical Panel</option>
                    <option value="System Design">System Design</option>
                    <option value="HR Screening">HR Screening</option>
                    <option value="Culture Fit">Culture Fit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Interviewer Name</label>
                  <input
                    type="text"
                    placeholder="Sarah Jenkins"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 2:00 PM - 3:00 PM EST"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <DialogClose render={
                  <Button type="button" variant="outline" className="h-10 text-xs">
                    Cancel
                  </Button>
                } />
                <Button type="submit" className="h-10 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground">
                  Confirm Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-3">
        {[
          { label: "Active Scheduled", value: stats.upcoming, icon: CalendarDays, color: "text-primary bg-primary/10" },
          { label: "Completed Sessions", value: stats.completed, icon: UserCheck, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Cancelled / Paused", value: stats.cancelled, icon: CalendarRange, color: "text-muted-foreground bg-muted" },
        ].map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{item.value} Interviews</h3>
              </div>
              <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="size-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main filters & list */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
          {/* Tabs */}
          <div className="flex bg-muted p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
            {[
              { id: "upcoming", label: `Upcoming (${stats.upcoming})` },
              { id: "completed", label: `Completed (${stats.completed})` },
              { id: "cancelled", label: `Cancelled (${stats.cancelled})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "upcoming" | "completed" | "cancelled")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidate or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 border bg-card pl-9 pr-4 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Interviews List */}
        <Card>
          <CardContent className="p-5">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-6 text-primary animate-spin" />
              </div>
            ) : filteredInterviews.length > 0 ? (
              <div className="divide-y space-y-4">
                {filteredInterviews.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 transition-all`}
                  >
                    {/* Candidate / Job info */}
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm mt-0.5">
                        {item.candidateName
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">{item.candidateName}</h4>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground font-medium">{item.candidateEmail}</span>
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider py-0.5 h-4.5 bg-primary/5 text-primary border-primary/10">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-foreground/90">{item.role}</p>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium flex-wrap pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" /> {item.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3 text-muted-foreground" /> {item.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="size-3 text-muted-foreground" /> Interviewer: {item.interviewer}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 text-[10px] font-bold gap-1 cursor-pointer border-primary/10 text-primary hover:bg-primary/5"
                        onClick={() => handleCopyLink(item.id, item.meetingLink)}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="size-3 text-emerald-400" /> Copied Link
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> Copy Invite Link
                          </>
                        )}
                      </Button>

                      {item.status === "scheduled" ? (
                        <>
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8.5 text-[10px] bg-primary text-primary-foreground font-bold inline-flex items-center justify-center rounded-lg px-3 gap-1.5 shadow-sm hover:bg-primary/95 transition-colors focus-ring cursor-pointer"
                          >
                            <Video className="size-3.5" /> Start Screening
                          </a>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8.5 text-[10px] font-bold hover:bg-emerald-500/10 hover:text-emerald-400"
                            onClick={() => handleStatusChange(item.id, "completed")}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8.5 text-[10px] font-bold hover:bg-red-500/10 text-destructive hover:text-destructive"
                            onClick={() => handleStatusChange(item.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : item.status === "completed" ? (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5 border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1 rounded-lg">
                          <Check className="size-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 border border-border bg-muted/30 px-2.5 py-1 rounded-lg">
                          <X className="size-3.5" /> Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <CalendarRange className="size-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-semibold text-sm">No interviews found in this view</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try adjusting your search criteria or schedule a new panel screening session.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
