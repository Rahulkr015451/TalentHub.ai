"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  FileText,
  Globe,
  UploadCloud,
  GraduationCap,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/shared/toast";
import { supabase } from "@/lib/supabase/client";

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

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function ProfilePage() {
  const { toast } = useToast();
  const [role, setRole] = useState<"candidate" | "recruiter" | null>(null);
  const [userName, setUserName] = useState("Jordan Doe");
  const [userEmail, setUserEmail] = useState("jordan@university.edu");

  // State fields
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [gradDate, setGradDate] = useState("");
  const [gpa, setGpa] = useState("");
  
  // Recruiter fields
  const [company, setCompany] = useState("");
  const [recruiterTitle, setRecruiterTitle] = useState("");

  // Resume status
  const [resumeName, setResumeName] = useState("resume.pdf");
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      setIsLoading(true);
      const rawSession = localStorage.getItem("talenthub-session");
      let activeEmail = "jordan@university.edu";
      let activeRole: "candidate" | "recruiter" = "candidate";
      let activeName = "Jordan Doe";

      if (rawSession) {
        const session = JSON.parse(rawSession);
        activeRole = session.role || "candidate";
        setRole(activeRole);
        if (session.name) {
          activeName = session.name;
          setUserName(activeName);
        }
        if (session.email) {
          activeEmail = session.email;
          setUserEmail(activeEmail);
        }
      } else {
        setRole("candidate");
      }

      try {
        // Query Supabase profiles table
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", activeEmail)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.name) setUserName(data.name);
          setBio(data.bio || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setUniversity(data.university || "");
          setDegree(data.degree || "");
          setGradDate(data.grad_date || "");
          setGpa(data.gpa || "");
          setCompany(data.company || "");
          setRecruiterTitle(data.recruiter_title || "");
          setResumeName(data.resume_name || "resume.pdf");
          setIsGithubConnected(!!data.github_connected);
        } else {
          // If no profile exists, create a default one
          const { error: insertErr } = await supabase.from("profiles").upsert({
            email: activeEmail,
            name: activeName,
            role: activeRole,
            bio: activeRole === "candidate" ? "Senior Computer Science Student at Stanford, specializing in Machine Learning & Frontend Engineering." : "Hiring manager at technology firm.",
            phone: "+1 (555) 019-2834",
            location: "Stanford, CA",
            university: activeRole === "candidate" ? "Stanford University" : "",
            degree: activeRole === "candidate" ? "B.S. in Computer Science" : "",
            grad_date: activeRole === "candidate" ? "June 2027" : "",
            gpa: activeRole === "candidate" ? "3.92" : "",
            company: activeRole === "recruiter" ? "Aether AI" : "",
            recruiter_title: activeRole === "recruiter" ? "Hiring Director" : "",
            resume_name: "Jordan_Doe_Resume_ML.pdf",
            github_connected: true
          }, { onConflict: "email" });
          if (insertErr) console.error("Could not seed default profile:", insertErr);
          
          // Set local default states
          setBio(activeRole === "candidate" ? "Senior Computer Science Student at Stanford, specializing in Machine Learning & Frontend Engineering." : "Hiring manager at technology firm.");
          setPhone("+1 (555) 019-2834");
          setLocation("Stanford, CA");
          if (activeRole === "candidate") {
            setUniversity("Stanford University");
            setDegree("B.S. in Computer Science");
            setGradDate("June 2027");
            setGpa("3.92");
          } else {
            setCompany("Aether AI");
            setRecruiterTitle("Hiring Director");
          }
          setResumeName("Jordan_Doe_Resume_ML.pdf");
          setIsGithubConnected(true);
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
        toast("Failed to synchronize profile settings", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        email: userEmail,
        name: userName,
        role: role || "candidate",
        phone,
        location,
        bio,
        university,
        degree,
        grad_date: gradDate,
        gpa,
        company,
        recruiter_title: recruiterTitle,
        resume_name: resumeName,
        github_connected: isGithubConnected,
        updated_at: new Date().toISOString()
      }, { onConflict: "email" });

      if (error) throw error;

      // Update local storage session
      const rawSession = localStorage.getItem("talenthub-session");
      if (rawSession) {
        const session = JSON.parse(rawSession);
        session.name = userName;
        localStorage.setItem("talenthub-session", JSON.stringify(session));
        window.dispatchEvent(new Event("storage"));
      }

      toast("Profile settings updated successfully!", "success");
    } catch (err) {
      toast((err as Error).message || "Failed to update profile settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (role === null || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRecruiter = role === "recruiter";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={isRecruiter ? "Employer Profile" : "Student Profile"}
        description={isRecruiter ? "Manage your hiring preferences and company details." : "Manage your academic records, resume credentials, and skill parameters."}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Profile Header Card */}
        <Card className="border shadow-md">
          <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="size-20 rounded-full bg-primary/10 text-primary border flex items-center justify-center text-3xl font-black font-heading shadow-xs">
                {userName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">
                  {userName}
                  {isGithubConnected && (
                    <Badge className="bg-success/10 text-success border-success/20 text-[10px] py-0.5 px-2 font-medium">
                      Verified Talent
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center md:justify-start">
                  <Mail className="size-3.5" /> {userEmail}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center md:justify-start">
                  <MapPin className="size-3.5" /> {location}
                </p>
              </div>
            </div>
            <Button type="submit" disabled={isSaving} className="bg-primary flex items-center gap-1.5">
              <Save className="size-4" /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Dynamic Fields Grid */}
        <div className="grid gap-6 md:grid-cols-12 items-start">
          {/* Main Info Columns (8/12) */}
          <div className="md:col-span-8 space-y-6">
            {/* General Bio Info */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <span className="font-semibold text-sm block border-b pb-2">About / Headline</span>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Bio Description</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full border bg-background/50 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Contact Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recruiter Details vs Student Education Details */}
            {isRecruiter ? (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <span className="font-semibold text-sm block border-b pb-2">Employer Configurations</span>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Current Company Name</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Hiring Title</label>
                      <input
                        type="text"
                        value={recruiterTitle}
                        onChange={(e) => setRecruiterTitle(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <span className="font-semibold text-sm block border-b pb-2 flex items-center gap-1.5">
                    <GraduationCap className="size-4 text-primary" /> Academic Profile (Student)
                  </span>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">University / Institution</label>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Degree / Major</label>
                      <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Graduation Date</label>
                      <input
                        type="text"
                        value={gradDate}
                        onChange={(e) => setGradDate(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">GPA Index</label>
                      <input
                        type="text"
                        value={gpa}
                        onChange={(e) => setGpa(e.target.value)}
                        className="w-full h-9 border bg-background/50 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info Columns (4/12) */}
          <div className="md:col-span-4 space-y-6">
            {/* Credentials / Resume Center for Students */}
            {!isRecruiter && (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <span className="font-semibold text-sm block border-b pb-2 flex items-center gap-1.5">
                    <FileText className="size-4 text-primary" /> Credentials Center
                  </span>
                  
                  {/* Current resume tag */}
                  <div className="bg-muted/40 border rounded-lg p-3 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Active CV Resume</span>
                    <span className="text-xs font-medium text-foreground block truncate">{resumeName}</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toast("Downloading active resume...", "info")}
                      className="w-full h-7 text-[10px] mt-1"
                    >
                      Download PDF
                    </Button>
                  </div>

                  {/* Drag drop simulation */}
                  <div className="border border-dashed rounded-xl py-6 text-center bg-card/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors">
                    <UploadCloud className="size-6 text-muted-foreground/60 mb-1.5" />
                    <span className="text-[10px] font-semibold text-foreground">Upload New CV</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">PDF or Word files</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social credentials */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <span className="font-semibold text-sm block border-b pb-2">Verified Connections</span>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <GithubIcon className="size-4" /> GitHub Link
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsGithubConnected(!isGithubConnected)}
                      className={`font-semibold cursor-pointer ${isGithubConnected ? "text-success" : "text-primary"}`}
                    >
                      {isGithubConnected ? "Connected" : "Connect"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <LinkedinIcon className="size-4" /> LinkedIn Link
                    </span>
                    <span className="text-muted-foreground font-semibold">Not Linked</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Globe className="size-4" /> Portfolio URL
                    </span>
                    <span className="text-muted-foreground font-semibold">Not Set</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
