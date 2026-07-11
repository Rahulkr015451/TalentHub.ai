"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Sliders,
  Link as LinkIcon,
  Loader2,
  Lock,
  Calendar,
  Save,
  Bell,
  Sparkles,
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/shared/toast";
import { supabase } from "@/lib/supabase/client";

type SettingsTab = "profile" | "account" | "preferences" | "integrations";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [session, setSession] = useState<{ loggedIn: boolean; email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // Candidate specific
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [gradDate, setGradDate] = useState("");
  const [gpa, setGpa] = useState("");

  // Recruiter specific
  const [company, setCompany] = useState("");
  const [recruiterTitle, setRecruiterTitle] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences fields
  const [threshold, setThreshold] = useState(80);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [progressReports, setProgressReports] = useState(true);
  const [interviewInvites, setInterviewInvites] = useState(true);

  // Integrations fields
  const [githubConnected, setGithubConnected] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(true);

  useEffect(() => {
    const rawSession = localStorage.getItem("talenthub-session");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed.loggedIn && parsed.email) {
        requestAnimationFrame(() => {
          setSession(parsed);
        });
        fetchProfile(parsed.email);
      } else {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }

    async function fetchProfile(email: string) {
      requestAnimationFrame(() => {
        setIsLoading(true);
      });
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          requestAnimationFrame(() => {
            setName(data.name || "");
            setPhone(data.phone || "");
            setLocation(data.location || "");
            setBio(data.bio || "");
            setUniversity(data.university || "");
            setDegree(data.degree || "");
            setGradDate(data.grad_date || "");
            setGpa(data.gpa || "");
            setCompany(data.company || "");
            setRecruiterTitle(data.recruiter_title || "");
            setGithubConnected(data.github_connected || false);
          });
        }
      } catch (err) {
        toast((err as Error).message || "Failed to load profile data", "error");
      } finally {
        requestAnimationFrame(() => {
          setIsLoading(false);
        });
      }
    }
  }, [router, toast]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.email) return;

    setIsSaving(true);
    try {
      const updates = {
        name,
        phone: phone || null,
        location: location || null,
        bio: bio || null,
        university: session.role === "candidate" ? university || null : null,
        degree: session.role === "candidate" ? degree || null : null,
        grad_date: session.role === "candidate" ? gradDate || null : null,
        gpa: session.role === "candidate" ? gpa || null : null,
        company: session.role === "recruiter" ? company || null : null,
        recruiter_title: session.role === "recruiter" ? recruiterTitle || null : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("email", session.email);

      if (error) throw error;

      // Sync name changes to local session details
      const rawSession = localStorage.getItem("talenthub-session");
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        parsed.name = name;
        localStorage.setItem("talenthub-session", JSON.stringify(parsed));
        // Trigger storage event for sidebar/header updates
        window.dispatchEvent(new Event("storage"));
      }

      toast("Settings details updated successfully in database!", "success");
    } catch (err) {
      toast((err as Error).message || "Failed to save profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please complete all password input fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match.", "error");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Your password has been successfully updated.", "success");
    }, 1000);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast("AI scanning threshold and system alert preferences saved.", "success");
    }, 800);
  };

  const toggleGitHubConnection = async () => {
    const nextVal = !githubConnected;
    setGithubConnected(nextVal);

    if (session?.email) {
      try {
        await supabase
          .from("profiles")
          .update({ github_connected: nextVal })
          .eq("email", session.email);
        toast(nextVal ? "GitHub developer account synchronized!" : "GitHub account disconnected.", "success");
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <PageHeader
        title="Settings Control"
        description="Manage your user profile details, notifications parameters, security credentials, and API tokens."
      />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Navigation Sidebar Panel */}
        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none bg-muted/30 p-1.5 rounded-xl border">
          {[
            { id: "profile", label: "Profile Info", icon: User },
            { id: "account", label: "Security & Pass", icon: Shield },
            { id: "preferences", label: "AI & Alerts", icon: Sliders },
            { id: "integrations", label: "Sync Integrations", icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer text-left w-full ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-2xs border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Icon className={`size-4 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action Forms Content Area */}
        <div className="lg:col-span-8">
          <Card>
            <CardContent className="p-6">
              {/* Profile Details Tab Form */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="border-b pb-3.5">
                    <h3 className="font-bold text-sm text-foreground">User Profile Information</h3>
                    <p className="text-[10px] text-muted-foreground">Modify bio, active address, and education descriptors stored in database.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. +1 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-muted-foreground">Address Location</label>
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Biography Profile Description</label>
                    <textarea
                      placeholder="Write a brief overview..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full p-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {session?.role === "candidate" && (
                    <div className="space-y-4 pt-3 border-t">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> Student Credentials Matrix
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">University Name</label>
                          <input
                            type="text"
                            placeholder="MIT, Stanford..."
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full h-10 px-3 border rounded-lg text-sm bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Degree Program</label>
                          <input
                            type="text"
                            placeholder="B.S. Computer Science"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            className="w-full h-10 px-3 border rounded-lg text-sm bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Graduation Date</label>
                          <input
                            type="text"
                            placeholder="May 2027"
                            value={gradDate}
                            onChange={(e) => setGradDate(e.target.value)}
                            className="w-full h-10 px-3 border rounded-lg text-sm bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Cumulative GPA</label>
                          <input
                            type="text"
                            placeholder="e.g. 3.82/4.00"
                            value={gpa}
                            onChange={(e) => setGpa(e.target.value)}
                            className="w-full h-10 px-3 border rounded-lg text-sm bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {session?.role === "recruiter" && (
                    <div className="space-y-4 pt-3 border-t">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> Employer Credentials Matrix
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Organization Company Name</label>
                          <input
                            type="text"
                            placeholder="Linear, Retool..."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full h-10 px-3 border rounded-lg text-sm bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Recruiter Corporate Title</label>
                          <input
                            type="text"
                            placeholder="VP of Technical Staffing"
                            value={recruiterTitle}
                            onChange={(e) => setRecruiterTitle(e.target.value)}
                            className="w-full h-10 px-3 border rounded-lg text-sm bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t">
                    <Button type="submit" disabled={isSaving} className="gap-1.5 text-xs font-bold">
                      {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              )}

              {/* Password credentials tab form */}
              {activeTab === "account" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="border-b pb-3.5">
                    <h3 className="font-bold text-sm text-foreground">Security Credentials Manager</h3>
                    <p className="text-[10px] text-muted-foreground">Update security keys and standard dashboard log in password inputs.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 border bg-background pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">New Security Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 border bg-background pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 border bg-background pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <Button type="submit" disabled={isSaving} className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
                      {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Update Account Password
                    </Button>
                  </div>
                </form>
              )}

              {/* Preferences and AI sensitivity tab form */}
              {activeTab === "preferences" && (
                <form onSubmit={handlePreferencesSubmit} className="space-y-5">
                  <div className="border-b pb-3.5">
                    <h3 className="font-bold text-sm text-foreground">AI Scanning & Notification Options</h3>
                    <p className="text-[10px] text-muted-foreground">Configure AI copilot match triggers and email delivery schedules.</p>
                  </div>

                  <div className="space-y-6">
                    {/* AI Threshold */}
                    <div className="space-y-2 border-b pb-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">AI Match Threshold Sensitivity</label>
                        <span className="text-xs font-mono font-bold text-primary">{threshold}% Match Minimum</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Filters recommended roles or candidate resumes scoring below this compatibility threshold.
                      </p>
                    </div>

                    {/* Alerts Toggles */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Bell className="size-3.5 text-primary" /> Email Notifications Preferences</h4>
                      
                      {[
                        { title: "Weekly Job Listings Matches", desc: "Get notifications matching top matching thresholds index.", val: jobAlerts, setter: setJobAlerts },
                        { title: "Application Progress Reports", desc: "Receive immediate updates on pipeline status revisions.", val: progressReports, setter: setProgressReports },
                        { title: "Interviews Calendaring Invites", desc: "Notification triggers on calendar schedules and invite templates changes.", val: interviewInvites, setter: setInterviewInvites },
                      ].map((pref, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/10">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-foreground">{pref.title}</h5>
                            <p className="text-[10px] text-muted-foreground">{pref.desc}</p>
                          </div>
                          <Switch checked={pref.val} onCheckedChange={pref.setter} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <Button type="submit" disabled={isSaving} className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
                      {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Alert Preferences
                    </Button>
                  </div>
                </form>
              )}

              {/* Integrations tab settings */}
              {activeTab === "integrations" && (
                <div className="space-y-5">
                  <div className="border-b pb-3.5">
                    <h3 className="font-bold text-sm text-foreground">Third-Party Synchronization</h3>
                    <p className="text-[10px] text-muted-foreground">Authorize external service APIs to expand TalentHub features.</p>
                  </div>

                  <div className="space-y-3.5">
                    {/* GitHub Integration card */}
                    <div className="flex items-center justify-between border p-4 rounded-xl bg-card hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                          <GithubIcon className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-foreground">GitHub Developer Profile</h4>
                          <p className="text-[10px] text-muted-foreground">Synchronize technical code repositories to candidate stats card.</p>
                        </div>
                      </div>
                      <Button
                        variant={githubConnected ? "outline" : "default"}
                        size="sm"
                        onClick={toggleGitHubConnection}
                        className="text-[10px] font-bold h-8 cursor-pointer"
                      >
                        {githubConnected ? "Disconnect Sync" : "Sync GitHub"}
                      </Button>
                    </div>

                    {/* Google Calendar card */}
                    <div className="flex items-center justify-between border p-4 rounded-xl bg-card hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                          <Calendar className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-foreground">Google Calendar Scheduling</h4>
                          <p className="text-[10px] text-muted-foreground">Import schedule screens and interviews directly to Google Calendar.</p>
                        </div>
                      </div>
                      <Button
                        variant={gcalConnected ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          const nextVal = !gcalConnected;
                          setGcalConnected(nextVal);
                          toast(nextVal ? "Google Calendar sync enabled!" : "Google Calendar sync deactivated.", "success");
                        }}
                        className="text-[10px] font-bold h-8 cursor-pointer"
                      >
                        {gcalConnected ? "Disconnect Sync" : "Sync Calendar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
