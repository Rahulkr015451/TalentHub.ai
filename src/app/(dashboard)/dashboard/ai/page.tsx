"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  DollarSign,
  Briefcase,
  XCircle,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";

interface SuggestionItem {
  text: string;
  action: string;
}

interface InterviewPrepItem {
  q: string;
  a: string;
}

interface LearningPathItem {
  title: string;
  resource: string;
  link: string;
}

interface RoleMatrix {
  matchScore: number;
  missingSkills: string[];
  suggestions: SuggestionItem[];
  interviewPrep: InterviewPrepItem[];
  learningPaths: LearningPathItem[];
}

// --- MOCK ROLES SPECIFICATION MATRIX ---
const ROLE_MATRICES: Record<string, RoleMatrix> = {
  "Senior React Engineer": {
    matchScore: 98,
    missingSkills: ["Go", "GraphQL"],
    suggestions: [
      { text: "Highlight GraphQL schema creation experience in your Stripe description bullets.", action: "Rewrite Tip" },
      { text: "Add Golang microservices details under backend architecture tags.", action: "Resume Edit" },
      { text: "Elaborate on Next.js rendering configurations (SSR vs ISR) under layout performance optimizations.", action: "Formatting Tip" }
    ],
    interviewPrep: [
      {
        q: "How would you optimize rendering performance for massive lists in React?",
        a: "Use windowing techniques (e.g., react-window or react-virtualized) to render only items in the viewport, preventing DOM layout thrashing. Combine this with React.memo on list items and verify profiling telemetry logs."
      },
      {
        q: "What is your strategy for state hydration errors in Next.js applications?",
        a: "Hydration errors occur when the server-rendered HTML diverges from the initial client render. Fix this by wrapping client-only wrappers in useEffect flags, avoiding date/locale calls directly during render, and checking layout tags."
      }
    ],
    learningPaths: [
      { title: "Building API Pipelines with Go", resource: "Go Dev docs guide", link: "#" },
      { title: "GraphQL schema design & resolvers patterns", resource: "Apollo Client Academy", link: "#" }
    ]
  },
  "AI Researcher (LLMs)": {
    matchScore: 78,
    missingSkills: ["Python", "PyTorch", "LLM Fine-tuning", "Transformers"],
    suggestions: [
      { text: "Add Python computing and data structures modules details under technical tags.", action: "Skills Addition" },
      { text: "Include PyTorch deep learning framework parameters inside project descriptions.", action: "Resume Edit" },
      { text: "Reference open-weight transformers optimization metrics under academic highlights.", action: "Formatting Tip" }
    ],
    interviewPrep: [
      {
        q: "Explain the architectural difference between self-attention and cross-attention.",
        a: "Self-attention correlates items within the same sequence (e.g. encoder-only layers), while cross-attention maps queries from an external sequence against values/keys of another (e.g. decoder mapping back to encoder blocks)."
      },
      {
        q: "How do you mitigate catastrophic forgetting during model fine-tuning?",
        a: " Catastrophic forgetting is addressed by implementing parameter-efficient fine-tuning (PEFT) methods like LoRA, freeze metrics adapters, or mixing original dataset arrays with new validation sequences."
      }
    ],
    learningPaths: [
      { title: "Deep Learning Foundations with PyTorch", resource: "Fast.ai Practical Course", link: "#" },
      { title: "Hugging Face Transformers Architecture", resource: "Hugging Face official guide", link: "#" }
    ]
  },
  "Product Designer": {
    matchScore: 68,
    missingSkills: ["Figma", "Design Systems", "Framer Prototyping", "User Research"],
    suggestions: [
      { text: "Specify design tokens and layouts parameters creation inside system audits descriptions.", action: "Resume Edit" },
      { text: "Detail Framer micro-interaction animations implementations under project portfolios.", action: "Visual Highlight" },
      { text: "Incorporate client interviews metrics feedback inside case study documentation.", action: "Copywriting Tip" }
    ],
    interviewPrep: [
      {
        q: "How do you advocate for layout density standards when developers request simpler spacing?",
        a: "Provide atomic design tokens grids (e.g., 4px base grids) mapping content to key workflows. Perform performance audits showing that compact information clusters speed up data retrieval times for operators."
      },
      {
        q: "Describe your process for conducting semantic accessibility reviews on UI widgets.",
        a: "Inspect structural layout hierarchy tags, verify contrast values (minimum 4.5:1 ratio), define keyboard tab focus indexes offsets, and validate aria descriptions descriptors using screen reader simulation software."
      }
    ],
    learningPaths: [
      { title: "Advanced Design Systems workflows", resource: "Figma Academy guides", link: "#" },
      { title: "UI/UX Accessibility (WCAG standards)", resource: "Interaction Design Institute", link: "#" }
    ]
  }
};

export default function AICareerCopilot() {
  // --- STATES ---
  const [selectedRole, setSelectedRole] = useState("Senior React Engineer");
  const [experienceYears, setExperienceYears] = useState(5);
  const [locationType, setLocationType] = useState("US_Remote");
  const [expandedPrep, setExpandedPrep] = useState<number | null>(null);

  // Retrieve matching role parameters
  const roleData = useMemo(() => {
    return ROLE_MATRICES[selectedRole] || ROLE_MATRICES["Senior React Engineer"];
  }, [selectedRole]);

  // --- SALARY ESTIMATOR MATH ---
  const estimatedSalary = useMemo(() => {
    const base = 120000;
    const expPremium = experienceYears * 8500;
    let multiplier = 1.0;

    if (locationType === "US_Remote") multiplier = 1.25;
    else if (locationType === "US_Hybrid") multiplier = 1.15;
    else if (locationType === "Global_Remote") multiplier = 0.95;

    const min = Math.round((base + expPremium) * multiplier * 0.9);
    const max = Math.round((base + expPremium) * multiplier * 1.1);

    return { min, max };
  }, [experienceYears, locationType]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="AI Career Copilot"
        description="Verify ATS scan alignments, check target salary ranges, and view optimized resume recommendations."
      />

      {/* Target Role configuration Selector card */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Target Audit Role</span>
            <h4 className="text-sm font-bold text-foreground">Select a target vacancy to run AI compatibility diagnostics:</h4>
          </div>

          <div className="relative shrink-0 w-full sm:w-64">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setExpandedPrep(null);
              }}
              className="w-full h-10 pl-9 pr-8 border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none font-semibold"
            >
              <option value="Senior React Engineer">Senior React Engineer</option>
              <option value="AI Researcher (LLMs)">AI Researcher (LLMs)</option>
              <option value="Product Designer">Product Designer</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </CardContent>
      </Card>

      {/* Grid: Main Diagnostics & Side Panels */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: ATS SUMMARY, SUGGESTIONS, INTERVIEWS (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ATS DIAGNOSTIC & RESUME GAUGE */}
          <div className="grid gap-4 sm:grid-cols-12">
            
            {/* Gauge widget (4 cols) */}
            <Card className="sm:col-span-4 border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-center p-6 text-center shadow-xs">
              <CardContent className="p-0 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">ATS Fit Score</span>
                
                {/* Circular ring */}
                <div className="relative size-24 mx-auto flex items-center justify-center">
                  <svg className="size-full" viewBox="0 0 36 36">
                    <path className="text-[#1D1D20]" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-400 transition-all duration-500" strokeWidth="3.2" strokeDasharray={`${roleData.matchScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-base font-extrabold font-mono text-emerald-400">{roleData.matchScore}%</span>
                </div>

                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-neutral-950 font-bold border-none text-[9px] py-0.5 px-2 mx-auto">
                  {roleData.matchScore >= 90 ? "Excellent Fit" : roleData.matchScore >= 75 ? "Good Match" : "Optimizations Required"}
                </Badge>
              </CardContent>
            </Card>

            {/* Suggestions summaries (8 cols) */}
            <Card className="sm:col-span-8 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                  <Sparkles className="size-3.5" /> AI Resume Suggestions
                </h4>

                <div className="space-y-3.5">
                  {roleData.suggestions.map((sug: SuggestionItem, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-wider shrink-0 mt-0.5 px-1 py-0 h-4.5 bg-primary/10 text-primary border-primary/20">
                        {sug.action}
                      </Badge>
                      <p className="text-muted-foreground leading-normal font-semibold">{sug.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MISSING SKILLS AUDIT */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <AlertTriangle className="size-4.5 text-amber-500" /> Missing Stack Skills Audit
                </h4>
                <p className="text-[10px] text-muted-foreground">These skills are explicitly listed in target job vacancies but are currently absent in your resume.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {roleData.missingSkills.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs font-bold border-red-500/20 bg-red-500/5 text-red-400 py-1 gap-1">
                    <XCircle className="size-3.5" /> {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* INTERVIEW PREPARATION GUIDE ACCORDION */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="border-b pb-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <MessageSquare className="size-4.5 text-primary" /> Interview Prep Accordion
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Custom questions generated by AI matching your profile gaps against target requirements.</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold">Role Specific</Badge>
              </div>

              <div className="border rounded-xl bg-card overflow-hidden shadow-xs divide-y">
                {roleData.interviewPrep.map((prep: InterviewPrepItem, idx: number) => (
                  <div key={idx} className="w-full">
                    <button
                      onClick={() => setExpandedPrep(expandedPrep === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold hover:bg-muted/40 transition-colors focus:outline-none cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><HelpCircle className="size-4 text-primary shrink-0" /> {prep.q}</span>
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", expandedPrep === idx && "rotate-180")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {expandedPrep === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-muted/10 border-t"
                        >
                          <div className="p-4 space-y-2 text-xs leading-relaxed">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Ideal AI Response Answer:</span>
                            <p className="text-muted-foreground">{prep.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: SALARY CALCULATOR, LEARNING & INSIGHTS (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          
          {/* INTERACTIVE SALARY ESTIMATOR */}
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="border-b pb-3 flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <DollarSign className="size-4 text-primary" /> Salary Estimator
                </span>
                <Badge className="bg-primary text-primary-foreground font-bold text-[9px] py-0">Estimated</Badge>
              </div>

              {/* Slider for experience years */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Experience Premium</span>
                  <span className="font-bold text-foreground">{experienceYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>

              {/* Location multipliers select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Workplace Location</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full h-10 border bg-card rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-semibold cursor-pointer"
                >
                  <option value="US_Remote">United States (Remote)</option>
                  <option value="US_Hybrid">United States (Hybrid)</option>
                  <option value="Global_Remote">International (Remote)</option>
                </select>
              </div>

              {/* Range Output Display */}
              <div className="bg-muted/30 border rounded-xl p-4 text-center space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calculated market value band</span>
                <h3 className="text-xl font-black text-foreground leading-none">
                  {formatCurrency(estimatedSalary.min)} - {formatCurrency(estimatedSalary.max)}
                </h3>
                <p className="text-[9px] text-muted-foreground font-medium">*Derived using verified platform tech wage data aggregates.</p>
              </div>
            </CardContent>
          </Card>

          {/* LEARNING RECOMMENDATIONS RECOMMENDATIONS */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <BookOpen className="size-3.5" /> Closing the Gaps
              </h4>

              <div className="space-y-3.5">
                {roleData.learningPaths.map((path: LearningPathItem, idx: number) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      {path.title} <ChevronRight className="size-3.5 text-muted-foreground" />
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Source: {path.resource}</span>
                      <a href={path.link} className="text-primary hover:underline flex items-center gap-0.5 font-bold">
                        Start Course <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CAREER INSIGHTS STACK TRENDS */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <TrendingUp className="size-3.5" /> Tech Career Trends
              </h4>

              <div className="space-y-3 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 font-bold">▲ +12.4%</span>
                  <span>Next.js rendering edge adapters adoption increased by startups.</span>
                </div>
                <div className="flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 font-bold">▲ +8.2%</span>
                  <span>Go (Golang) distributed backend database engineers salary averages.</span>
                </div>
                <div className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-500 font-bold">▼ -4.1%</span>
                  <span>Figma desktop legacy files export requirements down as design systems grow.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
