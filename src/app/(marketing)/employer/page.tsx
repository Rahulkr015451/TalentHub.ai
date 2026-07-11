"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Search,
  CalendarCheck,
  TrendingUp,
  Brain,
  Users,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployerLandingPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ loggedIn: boolean; role?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("talenthub-session");
    if (raw) {
      const parsedSession = JSON.parse(raw);
      if (parsedSession.loggedIn && parsedSession.role === "candidate") {
        // Enforce role separation: Student candidate cannot view employer homepage
        router.push("/");
        return;
      }
      requestAnimationFrame(() => {
        setSession(parsedSession);
      });
    } else {
      requestAnimationFrame(() => {
        setSession({ loggedIn: false });
      });
    }
  }, [router]);

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85dvh] flex items-center justify-center pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-primary/10 blur-[80px] sm:blur-[120px] animate-pulse dark:bg-primary/5" />
          <div className="absolute bottom-[20%] right-[-10%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-indigo-500/10 blur-[70px] sm:blur-[110px] dark:bg-indigo-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-35 dark:opacity-15" />
        </div>

        <Container>
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3 text-primary animate-pulse" />
              <span className="text-muted-foreground">TalentHub.ai for Tech Recruiters & Staffing Managers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] font-heading"
            >
              Find & Hire the Best <br />
              <span className="text-gradient">Engineering Talent</span> 10x Faster
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              Simplify your candidate screening process with automated resume scoring, collaborative scheduling tools, and centralized ATS funnels. TalentHub.ai gives you back 40+ hours per hire.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2"
            >
              {session?.loggedIn ? (
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold" render={<Link href="/dashboard" />}>
                  Recruiter Command Center
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold" render={<Link href="/login?role=recruiter" />}>
                    Sign In as Employer
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto shrink-0 border-primary/20 hover:border-primary/45" render={<Link href="/register?role=recruiter" />}>
                    Register Organization
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Trust logos / stats */}
      <section className="border-y bg-muted/20 py-8 overflow-hidden">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "AI Screening Accuracy", value: "98.4%" },
              { label: "Hours Saved per Post", value: "40+ Hrs" },
              { label: "ATS Integration Time", value: "< 5 Mins" },
              { label: "Active Tech Talents", value: "12,000+" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Feature cards layout */}
      <section className="py-20 bg-muted/10 border-b">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Recruitment Infrastructure Reimagined
            </h2>
            <p className="text-muted-foreground">
              A comprehensive set of tools built specifically for forward-thinking engineering teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Aether AI Matcher",
                desc: "Calculate automated ATS similarity scores mapping applicants' experiences directly against job requirements.",
                icon: Brain,
                bg: "bg-emerald-500/10 text-emerald-500",
              },
              {
                title: "Scheduling Pipeline",
                desc: "Send automated self-scheduling interview calendar links. No back-and-forth emails. Integration with top providers.",
                icon: CalendarCheck,
                bg: "bg-primary/10 text-primary",
              },
              {
                title: "Funnel Analytics",
                desc: "Monitor your candidate pipeline conversion metrics, stage transitions, and recruitment source performance.",
                icon: TrendingUp,
                bg: "bg-purple-500/10 text-purple-500",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border bg-card hover:border-primary/30 transition-all hover:-translate-y-0.5 duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${feature.bg}`}>
                    <feature.icon className="size-5.5" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Detail Callout Section */}
      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Dynamic Candidate Funnel</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight text-foreground">
                Simplify ATS management from screening to offer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                TalentHub provides a clear Kanban board directory of applicants, allowing you to update pipeline statuses instantly, filter by tech skills matrix, and initiate meeting screening invites in one unified place.
              </p>
              <div className="space-y-3.5">
                {[
                  "Intelligent matching score calculated instantly upon resume submission",
                  "Automated candidate email reminders for upcoming technical panels",
                  "Consolidated application tracking across all departments & locations",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="size-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl border bg-card p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="font-bold text-sm flex items-center gap-2"><Users className="size-4 text-primary" /> Active Open Positions</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Recruiter Portal</span>
              </div>
              <div className="space-y-3">
                {[
                  { role: "Senior Frontend Engineer", count: 18, match: 94 },
                  { role: "Staff Research AI Architect", count: 8, match: 89 },
                  { role: "Cloud Security Lead", count: 12, match: 91 },
                ].map((job, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-muted/30">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{job.role}</h4>
                      <p className="text-[10px] text-muted-foreground">{job.count} applicants in pipeline</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
                      {job.match}% Avg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
