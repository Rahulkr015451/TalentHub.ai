"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building,
  Activity,
  Sliders,
  ShieldCheck,
  Search,
  ChevronDown,
  FileText,
  Settings,
  Mail,
  UserCheck,
  ArrowLeft,
  SlidersHorizontal,
  Briefcase,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/shared/toast";
import { supabase } from "@/lib/supabase/client";
import type { ApplicationRow, JobRow, CompanyRow } from "@/lib/supabase/types";

// --- MOCK USERS ---
const INITIAL_USERS = [
  { id: "u-1", name: "Sarah Jenkins", email: "sarah.j@stripe.com", role: "RECRUITER", status: "Active", joined: "2026-07-01" },
  { id: "u-2", name: "Alex Rivera", email: "alex.rivera@gmail.com", role: "CANDIDATE", status: "Active", joined: "2026-07-08" },
  { id: "u-3", name: "David Chen", email: "david.c@gmail.com", role: "CANDIDATE", status: "Active", joined: "2026-07-09" },
  { id: "u-4", name: "Operations Dave", email: "dave.ops@talenthub.ai", role: "ADMIN", status: "Active", joined: "2026-06-15" },
  { id: "u-5", name: "Marcus Johnson", email: "marcus.j@figma.com", role: "RECRUITER", status: "Suspended", joined: "2026-07-07" },
];

// --- MOCK COMPANIES ---
const INITIAL_COMPANIES = [
  { id: "c-1", name: "Linear", slug: "linear", tier: "Pro Enterprise", seats: "8 / 15", verified: true },
  { id: "c-2", name: "Vercel", slug: "vercel", tier: "Pro Enterprise", seats: "12 / 20", verified: true },
  { id: "c-3", name: "Stripe", slug: "stripe", tier: "Pro Enterprise", seats: "3 / 5", verified: true },
  { id: "c-4", name: "Aether AI", slug: "aether", tier: "Free Trial", seats: "2 / 5", verified: false },
];

// --- MOCK AUDIT LOGS ---
const MOCK_AUDIT_LOGS = [
  { timestamp: "2026-07-09T12:30:00Z", actor: "Operations Dave", action: "Suspended User", target: "Marcus Johnson", detail: "Violated posting terms guidelines." },
  { timestamp: "2026-07-09T11:45:00Z", actor: "Clerk Webhook", action: "Synced Org", target: "Aether AI", detail: "Created tenant database tables mapping." },
  { timestamp: "2026-07-08T15:20:00Z", actor: "Sarah Jenkins", action: "Posted Job", target: "Senior React Engineer", detail: "Linear requisition auto-indexed." },
  { timestamp: "2026-07-08T10:00:00Z", actor: "System Agent", action: "Calculated Match", target: "Alex Rivera", detail: "Scored 98% compatibility match index." },
];

export default function AdminHubPage() {
  const router = useRouter();
  const { toast } = useToast();

  // --- TAB CONTROL ---
  const [activeTab, setActiveTab] = useState<"users" | "companies" | "applications" | "analytics" | "logs" | "settings">("users");

  // --- TAB-SPECIFIC FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");

  interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joined: string;
  }

  interface AdminCompany {
    id: string;
    name: string;
    slug: string;
    tier: string;
    seats: string;
    verified: boolean;
  }

  // --- INTERACTIVE DATABASE STATE ---
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [applications, setApplications] = useState<(ApplicationRow & { job?: (JobRow & { company?: CompanyRow | null }) | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    requestAnimationFrame(() => {
      setIsLoading(true);
    });
    try {
      // 1. Fetch profiles
      const { data: dbProfiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (dbProfiles) {
        const mappedUsers = dbProfiles.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: (p.role || "candidate").toUpperCase(),
          status: "Active",
          joined: p.created_at ? p.created_at.split("T")[0] : "2026-07-10",
        }));
        setUsers(mappedUsers.length > 0 ? mappedUsers : INITIAL_USERS);
      } else {
        setUsers(INITIAL_USERS);
      }

      // 2. Fetch companies
      const { data: dbCompanies } = await supabase.from("companies").select("*").order("name");
      if (dbCompanies) {
        const mappedCos = dbCompanies.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          tier: "Pro Enterprise",
          seats: "3 / 5",
          verified: true,
        }));
        setCompanies(mappedCos.length > 0 ? mappedCos : INITIAL_COMPANIES);
      } else {
        setCompanies(INITIAL_COMPANIES);
      }

      // 3. Fetch applications
      const { data: dbApps } = await supabase
        .from("applications")
        .select("*, job:jobs(*, company:companies(*))")
        .order("created_at", { ascending: false });
      if (dbApps) {
        setApplications(dbApps as (ApplicationRow & { job?: (JobRow & { company?: CompanyRow | null }) | null })[]);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
      toast("Error loading dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdminData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAdminData]);

  // Update user suspension (local simulation)
  const handleToggleSuspendUser = (id: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
          toast(`User ${u.name} status updated to ${nextStatus}.`, "info");
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Toggle company verification (local simulation)
  const handleToggleVerifyCompany = (id: string) => {
    setCompanies(
      companies.map((c) => {
        if (c.id === id) {
          const nextVerified = !c.verified;
          toast(`Company ${c.name} verification status updated.`, "success");
          return { ...c, verified: nextVerified };
        }
        return c;
      })
    );
  };

  // Update Application Status in Supabase
  const handleUpdateAppStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)));
      toast(`Application status updated to ${newStatus}`, "success");
    } catch (err) {
      toast((err as Error).message || "Failed to update status", "error");
    }
  };

  // Delete Application from Supabase
  const handleDeleteApp = async (id: string) => {
    try {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
      setApplications((prev) => prev.filter((app) => app.id !== id));
      toast("Application removed successfully", "info");
    } catch (err) {
      toast((err as Error).message || "Failed to remove application", "error");
    }
  };

  // Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRole === "All" || u.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Filter Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = selectedTier === "All" || c.tier === selectedTier;
      return matchSearch && matchTier;
    });
  }, [companies, searchQuery, selectedTier]);

  // Filter Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const name = app.user_name || "";
      const email = app.user_email || "";
      const jobTitle = app.job?.title || "";
      const companyName = app.job?.company?.name || "";
      const q = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q)
      );
    });
  }, [applications, searchQuery]);

  return (
    <div className="min-h-screen bg-app flex">
      {/* LEFT COLUMN: HIGH-DENSITY ADMIN SIDEBAR (240px) */}
      <aside className="w-60 border-r shrink-0 self-stretch p-5 hidden md:flex flex-col justify-between bg-surface/30">
        <div className="space-y-6">
          {/* Logo brand info */}
          <div className="flex items-center gap-2 border-b pb-4">
            <span className="text-primary font-heading font-black text-lg">⚡ Admin Panel</span>
            <Badge variant="outline" className="text-[8px] h-4 font-bold border-red-500/20 bg-red-500/5 text-red-400">OPERATIONS</Badge>
          </div>

          {/* Org Selector Stripe style */}
          <div className="bg-muted/40 border rounded-lg p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-muted/60 transition-colors">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">TalentHub AI</span>
              <p className="text-[10px] text-muted-foreground">Dave (System Admin)</p>
            </div>
            <ShieldCheck className="size-4.5 text-primary" />
          </div>

          {/* Navigation flat elements (Raycast style) */}
          <nav className="space-y-1">
            {[
              { id: "users", label: "User Management", icon: Users },
              { id: "companies", label: "Company Registry", icon: Building },
              { id: "applications", label: "Applied Candidates", icon: UserCheck },
              { id: "analytics", label: "Platform Analytics", icon: Activity },
              { id: "logs", label: "System Audit Logs", icon: FileText },
              { id: "settings", label: "System Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setSearchQuery("");
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom utility */}
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="size-4" /> Exit to Candidate Hub
          </button>
        </div>
      </aside>

      {/* RIGHT COLUMN: MAIN CANVAS (Fluid Width) */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* MOBILE NAVIGATION tabs (shown on small screen only) */}
        <div className="flex md:hidden items-center justify-between border-b pb-4">
          <span className="font-heading font-black text-base text-foreground">⚡ Platform Admin</span>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
            className="border bg-card text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
          >
            <option value="users">User Management</option>
            <option value="companies">Company Registry</option>
            <option value="applications">Applied Candidates</option>
            <option value="analytics">Platform Analytics</option>
            <option value="logs">System Audit Logs</option>
            <option value="settings">System Settings</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-semibold">Synchronizing admin controls...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ─── TAB: USER MANAGEMENT ────────────────────────────── */}
            {activeTab === "users" && (
          <div className="space-y-6">
            <PageHeader
              title="User Directory"
              description="Monitor active user listings, assign permission flags, or execute suspension audits."
            />

            {/* Filter tool deck */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, or credentials..."
                  className="w-full h-10 border bg-card rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="relative shrink-0">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-10 pl-9 pr-8 border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
                >
                  <option value="All">All Roles</option>
                  <option value="CANDIDATE">Candidates</option>
                  <option value="RECRUITER">Recruiters</option>
                  <option value="ADMIN">Admins</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-1">Name & Email</th>
                        <th className="pb-3">Role Code</th>
                        <th className="pb-3">Registration Date</th>
                        <th className="pb-3">Safety Status</th>
                        <th className="pb-3 text-right pr-1">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 pl-1 font-semibold">
                            <div className="font-bold text-sm">{user.name}</div>
                            <div className="text-[10px] text-muted-foreground">{user.email}</div>
                          </td>
                          <td className="py-3">
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">{user.role}</Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">{formatDate(user.joined)}</td>
                          <td className="py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold py-0.5",
                                user.status === "Active" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-red-400 border-red-500/20 bg-red-500/5"
                              )}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right pr-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSuspendUser(user.id)}
                              className={cn(
                                "h-7 text-[10px] font-bold cursor-pointer",
                                user.status === "Active" ? "hover:text-red-400 hover:border-red-500/30" : "hover:text-emerald-400 hover:border-emerald-500/30"
                              )}
                            >
                              {user.status === "Active" ? "Suspend Account" : "Unsuspend"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── TAB: COMPANY REGISTRY ───────────────────────────── */}
        {activeTab === "companies" && (
          <div className="space-y-6">
            <PageHeader
              title="Company Directory"
              description="Verify corporate registry profiles, check active seat allocations, and toggle verification badges."
            />

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company registry by name..."
                  className="w-full h-10 border bg-card rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="relative shrink-0">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="h-10 pl-9 pr-8 border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
                >
                  <option value="All">All Plans</option>
                  <option value="Pro Enterprise">Enterprise</option>
                  <option value="Free Trial">Free Trial</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-1">Company</th>
                        <th className="pb-3">Tenant Slug</th>
                        <th className="pb-3">Subscription Tier</th>
                        <th className="pb-3">Seat Allocations</th>
                        <th className="pb-3">Verification Badge</th>
                        <th className="pb-3 text-right pr-1">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredCompanies.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 pl-1 font-bold text-sm text-foreground">{c.name}</td>
                          <td className="py-3.5 text-muted-foreground font-mono">{c.slug}</td>
                          <td className="py-3.5">
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">{c.tier}</Badge>
                          </td>
                          <td className="py-3.5 text-muted-foreground font-semibold">{c.seats} seats</td>
                          <td className="py-3.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold py-0.5",
                                c.verified ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-muted-foreground border-border bg-muted/20"
                              )}
                            >
                              {c.verified ? "VERIFIED" : "UNVERIFIED"}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right pr-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleVerifyCompany(c.id)}
                              className="h-7 text-[10px] font-bold cursor-pointer"
                            >
                              {c.verified ? "Remove Badge" : "Approve Verify"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── TAB: PLATFORM ANALYTICS ─────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <PageHeader
              title="Platform Insights"
              description="Global overview metrics tracking hires count, seat conversions, and database transactions activity."
            />

            {/* Metrics cards deck */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Active Accounts</span>
                    <h3 className="text-2xl font-bold tracking-tight">1,248 Users</h3>
                    <p className="text-[10px] text-muted-foreground">+24 registered this week</p>
                  </div>
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Tenant Companies</span>
                    <h3 className="text-2xl font-bold tracking-tight">84 Organizations</h3>
                    <p className="text-[10px] text-muted-foreground">92% on Pro Enterprise</p>
                  </div>
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building className="size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Daily API Queries</span>
                    <h3 className="text-2xl font-bold tracking-tight">142k Requests</h3>
                    <p className="text-[10px] text-muted-foreground">Sub-15ms database latency</p>
                  </div>
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Activity className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Custom line graph showing global active sessions */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <Activity className="size-4 text-primary animate-pulse" /> Global System Load Telemetry
                  </span>
                  <Badge variant="outline" className="text-[9px] font-bold">Latency Graph</Badge>
                </div>

                <div className="h-44 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="100" y2="0" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />
                    <line x1="0" y1="12" x2="100" y2="12" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />
                    <line x1="0" y1="24" x2="100" y2="24" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />
                    <line x1="0" y1="35" x2="100" y2="35" stroke="var(--border)" strokeWidth="0.05" strokeDasharray="1 1" />

                    <defs>
                      <linearGradient id="admin-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5E6AD2" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#5E6AD2" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 35 L 0 20 L 20 8 L 40 28 L 60 12 L 80 5 L 100 18 L 100 35 Z" fill="url(#admin-glow)" />

                    <path
                      d="M 0 20 L 20 8 L 40 28 L 60 12 L 80 5 L 100 18"
                      fill="none"
                      stroke="#5E6AD2"
                      strokeWidth="0.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex justify-between text-[8px] text-muted-foreground pt-1.5 font-bold font-mono">
                    <span>12:00 AM</span>
                    <span>4:00 AM</span>
                    <span>8:00 AM</span>
                    <span>12:00 PM</span>
                    <span>4:00 PM</span>
                    <span>8:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── TAB: SYSTEM AUDIT LOGS ──────────────────────────── */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <PageHeader
              title="Operational Audit Logs"
              description="Compliance event logger tracking system executions, Clerk webhooks sync, and administrator actions."
            />

            <Card>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {MOCK_AUDIT_LOGS.map((log, idx) => (
                    <div key={idx} className="border bg-muted/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground">{log.actor}</span>
                          <Badge variant="secondary" className="text-[8px] font-mono py-0 h-4">{log.action}</Badge>
                          <span className="text-[10px] text-muted-foreground font-semibold">on target: {log.target}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">{log.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold font-mono shrink-0">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── TAB: SYSTEM SETTINGS ───────────────────────────── */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <PageHeader
              title="Platform Configurations"
              description="Adjust SSO settings, request limitations thresholds, and verify global model versions."
            />

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <Sliders className="size-4.5 text-primary" /> Settings Panel
                  </h4>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  {/* Single Sign-On */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-0.5">
                      <span className="text-foreground font-bold">Enforce SAML Single Sign-On (SSO)</span>
                      <p className="text-[10px] text-muted-foreground font-medium">Require verified corporate email domains to authenticate via Clerk SSO.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="size-4.5 rounded accent-primary cursor-pointer" />
                  </div>

                  {/* API thresholds */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-0.5">
                      <span className="text-foreground font-bold">API Threshold Rate-Limits</span>
                      <p className="text-[10px] text-muted-foreground font-medium">Cap request rates at 10,000 queries per hour for free tenant trials.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="size-4.5 rounded accent-primary cursor-pointer" />
                  </div>

                  {/* Score thresholds */}
                  <div className="space-y-2">
                    <span className="text-foreground font-bold">AI Vector Score Match Threshold</span>
                    <p className="text-[10px] text-muted-foreground font-medium">Ignore recommender profiles returning matching indices under 80%.</p>
                    <select className="w-full h-10 border bg-card rounded-lg px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="75">75% Min Score</option>
                      <option value="80" selected>80% Min Score</option>
                      <option value="85">85% Min Score</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button className="h-10 text-xs bg-primary">
                    Save Config Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── TAB: APPLIED CANDIDATES ──────────────────────────── */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <PageHeader
                title="Applied Candidates"
                description="Monitor candidate applications, check matching scores, adjust recruitment stages, or remove logs."
              />
              <Button
                onClick={() => router.push("/dashboard/jobs/create")}
                className="bg-primary flex items-center gap-1.5 h-10 text-xs font-bold shrink-0 shadow-md cursor-pointer hover:opacity-95"
              >
                <Briefcase className="size-4" /> Post a New Job
              </Button>
            </div>

            {/* Filter toolbar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications by candidate name, email, job title, or company..."
                  className="w-full h-10 border bg-card rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-1">Candidate Details</th>
                        <th className="pb-3">Job Listing</th>
                        <th className="pb-3">Match Score</th>
                        <th className="pb-3">Hiring Phase</th>
                        <th className="pb-3 text-right pr-1">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredApps.length > 0 ? (
                        filteredApps.map((app) => (
                          <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 pl-1 font-semibold">
                              <div className="font-bold text-sm text-foreground">{app.user_name || "Candidate User"}</div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Mail className="size-3" /> {app.user_email}
                              </div>
                              <div className="text-[9px] text-muted-foreground/80 mt-0.5">
                                Applied on {app.created_at ? app.created_at.split("T")[0] : "2026-07-10"}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="font-semibold text-foreground text-xs">{app.job?.title || "Role Listing"}</div>
                              <div className="text-[10px] text-muted-foreground">{app.job?.company?.name || "Company"}</div>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-bold",
                                  (app.match_score || 90) >= 90
                                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                    : "text-amber-400 border-amber-500/20 bg-amber-500/5"
                                )}
                              >
                                {app.match_score || 90}% AI Match
                              </Badge>
                            </td>
                            <td className="py-3">
                              <select
                                value={app.status || "Applied"}
                                onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                                className="h-8 border bg-card text-xs rounded-lg px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Screening">Screening</option>
                                <option value="Interview">Interview</option>
                                <option value="Offered">Offered</option>
                                <option value="Hired">Hired</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="py-3 text-right pr-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteApp(app.id)}
                                className="h-8 w-8 p-0 border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer hover:border-red-500/40 inline-flex items-center justify-center rounded-lg"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                            No candidate applications found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )}
  </main>
    </div>
  );
}
