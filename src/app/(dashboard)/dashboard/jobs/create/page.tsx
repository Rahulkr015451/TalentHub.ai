"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/shared/toast";
import { createJob } from "@/lib/supabase/data-access";
import type { JobInsert } from "@/lib/supabase/types";

export default function CreateJobPage() {
  const router = useRouter();

  const { toast } = useToast();

  // --- FORM STATES ---
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [workplace, setWorkplace] = useState("Remote");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [publisherEmail, setPublisherEmail] = useState("");

  useEffect(() => {
    const rawSession = localStorage.getItem("talenthub-session");
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session.email) {
        requestAnimationFrame(() => {
          setPublisherEmail(session.email);
        });
      }
    }
  }, []);

  // --- AI ASSISTANT STATES ---
  const [aiNotes, setAiNotes] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Simulate AI parsing of raw description notes
  const handleAiAutoFill = () => {
    if (!aiNotes.trim()) return;
    setIsAiLoading(true);

    setTimeout(() => {
      // Analyze text keywords to simulate extraction
      const notes = aiNotes.toLowerCase();
      
      if (notes.includes("react") || notes.includes("frontend") || notes.includes("next")) {
        setTitle("Senior React & Frontend Developer");
        setCategory("Engineering");
        setLocation("New York, NY (Remote Option)");
        setWorkplace("Remote");
        setSalaryMin("140000");
        setSalaryMax("185000");
        setSkills(["React", "TypeScript", "Tailwind CSS", "Next.js"]);
        setDescription("We are looking for a Senior React Engineer to spearhead our UI rebuild. You will work directly with our design engineering specialists on performance optimization pipelines.");
      } else if (notes.includes("design") || notes.includes("figma") || notes.includes("ux")) {
        setTitle("Senior Product Designer");
        setCategory("Design");
        setLocation("San Francisco, CA");
        setWorkplace("Hybrid");
        setSalaryMin("130000");
        setSalaryMax("170000");
        setSkills(["Figma", "Design Systems", "Prototyping", "UI/UX"]);
        setDescription("Join us to establish global visual standards across our core application views. You will lead layout density audits and build accessible components templates.");
      } else {
        // Fallback generic parse
        setTitle("Full-Stack Tech Engineer");
        setCategory("Engineering");
        setLocation("Remote");
        setWorkplace("Remote");
        setSalaryMin("120000");
        setSalaryMax("160000");
        setSkills(["JavaScript", "TypeScript", "APIs"]);
        setDescription("Looking for a generalist technical engineer to contribute across databases architectures, APIs, and client-side page views.");
      }

      setIsAiLoading(false);
      toast("AI Auto-Fill Complete!", "success");
    }, 1200);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast("Please fill in the job title and detailed description fields.", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Determine experience level dynamically based on title
      let exp = "Mid";
      const titleLower = title.toLowerCase();
      if (titleLower.includes("senior")) exp = "Senior";
      else if (titleLower.includes("lead")) exp = "Lead";
      else if (titleLower.includes("executive") || titleLower.includes("director")) exp = "Executive";
      else if (titleLower.includes("junior") || titleLower.includes("associate") || titleLower.includes("intern")) exp = "Entry";

      const payload = {
        company_id: "c0000001-0000-0000-0000-000000000004", // Default to Stripe organization
        publisher_email: publisherEmail || null,
        title,
        description,
        location: location || "Remote",
        type: workplace,
        department: category,
        experience: exp,
        salary_min: salaryMin ? Number(salaryMin) : 100000,
        salary_max: salaryMax ? Number(salaryMax) : 150000,
        skills,
        match_score: 90,
        status: "open",
        posted_at: new Date().toISOString(),
      };

      const { error } = await createJob(payload as unknown as JobInsert);
      if (error) throw error;

      toast("Job post published successfully!", "success");
      router.push("/dashboard/jobs");
    } catch (err) {
      toast((err as Error).message || "Failed to publish job posting", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">

      {/* Back Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/jobs")}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer focus-ring px-2.5 py-1.5 rounded-lg border bg-card shadow-2xs transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Job Dashboard
        </button>
      </div>

      <PageHeader
        title="Post a Job Vacancy"
        description="Paste raw requisition notes to let our AI Autopopulate fields, or manually build job postings."
      />

      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* LEFT COLUMN: MAIN FORM BUILDER (7/12 cols) */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full h-10 border bg-card rounded-lg px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
                  />
                </div>

                {/* Category & Workplace double grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Department Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 border bg-card rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Workplace Mode</label>
                    <select
                      value={workplace}
                      onChange={(e) => setWorkplace(e.target.value)}
                      className="w-full h-10 border bg-card rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                </div>

                {/* Location & Salary double grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New York, NY"
                        className="w-full h-10 border bg-card rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Salary Range (USD / Year)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                          placeholder="Min"
                          className="w-full h-10 border bg-card rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <span className="text-muted-foreground text-xs">-</span>
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={salaryMax}
                          onChange={(e) => setSalaryMax(e.target.value)}
                          placeholder="Max"
                          className="w-full h-10 border bg-card rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Skills tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Skills Required</label>
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add tag (e.g. React)"
                      className="flex-1 h-9 border bg-card rounded-lg px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button type="submit" size="sm" className="h-9 text-xs">Add</Button>
                  </form>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 pr-1.5 font-semibold text-[10px]">
                          {skill} <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-foreground text-muted-foreground cursor-pointer">×</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Detailed Requisition Overview</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide overview details, candidate expectations, qualifications..."
                    className="w-full border bg-card rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t">
                <Button variant="outline" className="flex-1 h-10 text-xs" onClick={() => router.push("/dashboard/jobs")}>
                  Cancel
                </Button>
                <Button className="flex-1 h-10 text-xs bg-primary gap-1.5" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Publishing...
                    </>
                  ) : (
                    "Save Job Listing"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI NOTES CO-PILOT ASSISTANT (5/12 cols) */}
        <div className="md:col-span-5 space-y-6 sticky top-20">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/10 pb-2">
                <Sparkles className="size-4 animate-pulse" /> AI Requisition Co-Pilot
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Paste messy notes, emails, or raw requirements text below. Our AI will automatically parse the layout constraints, salary ranges, categories, and tags to compile the form.
              </p>

              <div className="space-y-3.5">
                <textarea
                  rows={6}
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  placeholder="e.g. Need a senior React engineer who knows Tailwind and NextJS, based in NY, paying around 150k."
                  className="w-full border bg-background rounded-lg p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />

                <Button
                  onClick={handleAiAutoFill}
                  disabled={isAiLoading || !aiNotes.trim()}
                  className="w-full text-xs h-9 bg-primary gap-1.5 cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Extracting details...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" /> Autopopulate using AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
