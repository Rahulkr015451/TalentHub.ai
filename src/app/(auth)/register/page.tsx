"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/shared/toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      const roleParam = params.get("role");
      requestAnimationFrame(() => {
        if (emailParam) setEmail(emailParam);
        if (roleParam === "candidate" || roleParam === "recruiter") {
          setRole(roleParam);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Please fill in all form inputs.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Check if email already exists in profiles
      const { data: existing } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        toast("An account with this email already exists. Please Sign In.", "error");
        setIsLoading(false);
        return;
      }

      // 2. Create the profile record in Supabase
      const { error } = await supabase.from("profiles").insert({
        email,
        name,
        role,
        bio: role === "candidate" 
          ? "Senior Computer Science Student, specializing in Frontend Engineering." 
          : "Hiring recruiter.",
        phone: "+1 (555) 019-2834",
        location: "United States",
      });

      if (error) throw error;

      // 3. Save session
      localStorage.setItem("talenthub-session", JSON.stringify({ loggedIn: true, email, name, role }));
      toast(`Registration complete! Signed in as ${role === "candidate" ? "Candidate" : "Recruiter"}.`, "success");
      router.push("/dashboard");
    } catch (err) {
      toast((err as Error).message || "Failed to create account profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border shadow-lg backdrop-blur-md bg-card/60">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Create Account</h2>
          <p className="text-xs text-muted-foreground">Get started by setting up your TalentHub profile credentials.</p>
        </div>

        {/* Role Toggle cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "candidate", label: "Jobseeker", icon: User, desc: "Apply for vacancies" },
            { id: "recruiter", label: "Recruiter", icon: Briefcase, desc: "Post vacancies" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = role === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setRole(item.id as typeof role)}
                type="button"
                className={cn(
                  "p-3 rounded-xl border text-left cursor-pointer flex flex-col gap-1.5 focus-ring bg-card/40 transition-all duration-150 select-none",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-bold text-foreground">{item.label}</span>
                </div>
                <p className="text-[9px] text-muted-foreground leading-normal">{item.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Inputs form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full h-10 border bg-background/50 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@stripe.com"
                className="w-full h-10 border bg-background/50 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 border bg-background/50 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-10 text-xs font-bold bg-primary mt-2">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-1">Create Account <ArrowRight className="size-3.5" /></span>
            )}
          </Button>
        </form>

        {/* Footer redirection */}
        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
