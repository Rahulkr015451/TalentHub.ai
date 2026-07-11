"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Award, ShieldCheck, HeartHandshake, Milestone } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Engineering Candidates Matched", value: "12,000+" },
    { label: "Corporate Hiring Organizations", value: "650+" },
    { label: "Matching Vector Precision Index", value: "98.4%" },
    { label: "Average Time-to-Hire Reduction", value: "40%" },
  ];

  const milestones = [
    {
      year: "2024",
      title: "TalentHub Inception",
      desc: "Founded by a team of machine learning researchers and tech recruitment veterans seeking to remove bias from engineer screening.",
    },
    {
      year: "2025",
      title: "Aether AI Integration",
      desc: "Launched our core skill-vector semantic matching engine, analyzing structural resume traits against live job descriptions.",
    },
    {
      year: "2026",
      title: "Recruiter Command Suite",
      desc: "Expanded into direct self-scheduling interview workflows and automated ATS pipeline funnels.",
    },
  ];

  const values = [
    {
      title: "Scientific Precision",
      desc: "We build matching criteria based on verified credentials, clean skill vectors, and actual project matches, rather than keyword stuffing.",
      icon: Award,
    },
    {
      title: "Hiring Fairness",
      desc: "We strip away biographical indicators during search screening to establish clean, unbiased, and merit-based pipelines.",
      icon: ShieldCheck,
    },
    {
      title: "Human Synergy",
      desc: "AI is our assistant, not the decider. We construct tools that amplify recruiters' abilities while leaving decisions to humans.",
      icon: HeartHandshake,
    },
  ];

  const team = [
    {
      name: "Marcus Aurelius",
      role: "Co-Founder & CEO",
      bio: "Former Director of Engineering at Retool. Passionate about structuring tech interview loops.",
      initials: "MA",
    },
    {
      name: "Dr. Rivera Chen",
      role: "Lead AI Architect",
      bio: "PhD in NLP from Stanford. Architect of Aether Matcher's semantic vector alignment.",
      initials: "RC",
    },
    {
      name: "Sarah Jenkins",
      role: "VP of People Operations",
      bio: "12+ years building global technical recruiting funnels at Stripe and Linear.",
      initials: "SJ",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background glowing highlights */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-primary/10 blur-[90px] dark:bg-primary/5" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/5" />
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20">
        <Container>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold animate-pulse"
            >
              <Sparkles className="size-3 text-primary" />
              <span className="text-muted-foreground">Engineering the Future of Recruitment</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-heading"
            >
              Unifying AI matching with <br />
              <span className="text-gradient">Collaborative Recruiting</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed"
            >
              We believe that recruitment should be clean, efficient, and direct. TalentHub builds technology that bridges tech talent and organizations seamlessly.
            </motion.p>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/20 py-10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black font-heading text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Core Values Section */}
      <section className="py-20">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight font-heading">Our Core Values</h2>
            <p className="text-sm text-muted-foreground">The foundational guidelines driving every line of code we ship.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <Card key={idx} className="bg-card border hover:border-primary/30 transition-all hover:-translate-y-0.5 duration-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="size-4.5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{val.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Timeline Milestones Section */}
      <section className="py-20 bg-muted/10 border-y">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight font-heading flex items-center justify-center gap-2">
              <Milestone className="size-7 text-primary" /> Journey Milestones
            </h2>
            <p className="text-sm text-muted-foreground">How TalentHub progressed from an idea to a global hiring hub.</p>
          </div>

          <div className="max-w-3xl mx-auto relative border-l pl-6 space-y-8">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative space-y-2">
                {/* Timeline circle indicator */}
                <div className="absolute -left-[31px] top-1.5 size-4 rounded-full border bg-background flex items-center justify-center">
                  <div className="size-2 rounded-full bg-primary" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {m.year}
                  </span>
                  <h4 className="font-bold text-sm text-foreground">{m.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{m.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Leadership Team Grid Section */}
      <section className="py-20">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight font-heading flex items-center justify-center gap-2">
              <Users className="size-7 text-primary" /> Behind the Hub
            </h2>
            <p className="text-sm text-muted-foreground">Meet the engineers, designers, and operators building our network.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <Card key={idx} className="bg-card border hover:border-primary/20 transition-all">
                <CardContent className="p-5 text-center space-y-3 flex flex-col items-center">
                  <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                    {member.initials}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-foreground">{member.name}</h4>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{member.role}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
