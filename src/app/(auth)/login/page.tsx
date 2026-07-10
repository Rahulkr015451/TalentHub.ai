"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/shared/toast";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeRole, setActiveRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all credentials fields.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Query profiles by email to check role matching
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;

      const isRecruiter = activeRole === "recruiter";

      if (profile) {
        // Enforce role separation: Employer cannot sign in as Student, and Student cannot sign in as Employer
        const profileRole = (profile.role || "candidate").toLowerCase();
        if (profileRole === "recruiter" && !isRecruiter) {
          toast("This email is registered as an Employer. Please use the Employer Sign In tab.", "error");
          setIsLoading(false);
          return;
        }
        if (profileRole === "candidate" && isRecruiter) {
          toast("This email is registered as a Student. Please use the Student Sign In tab.", "error");
          setIsLoading(false);
          return;
        }

        // Set session using their database name
        localStorage.setItem(
          "talenthub-session",
          JSON.stringify({
            loggedIn: true,
            email,
            name: profile.name || (isRecruiter ? "Employer User" : "Candidate User"),
            role: profileRole,
          })
        );
      } else {
        // If no account exists, redirect them to the registration page
        toast("No account found for this email. Redirecting to registration page...", "info");
        router.push(`/register?email=${encodeURIComponent(email)}&role=${activeRole}`);
        setIsLoading(false);
        return;
      }

      toast(`Welcome back to TalentHub as ${isRecruiter ? "Employer" : "Student"}!`, "success");
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      toast((err as Error).message || "Authentication error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border shadow-lg backdrop-blur-md bg-card/60">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">Sign in to search vacancies or manage your organization.</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveRole("candidate")}
            className={cn(
              "py-1.5 rounded-md text-center transition-all cursor-pointer",
              activeRole === "candidate"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("recruiter")}
            className={cn(
              "py-1.5 rounded-md text-center transition-all cursor-pointer",
              activeRole === "recruiter"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Employer Sign In
          </button>
        </div>

        {/* Mock Social Sign In */}
        <div className="grid grid-cols-3 gap-2">
          {["Google", "GitHub", "Apple"].map((provider) => (
            <button
              key={provider}
              onClick={async () => {
                setIsLoading(true);
                const providerEmail = `${provider.toLowerCase()}@example.com`;
                try {
                  const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("email", providerEmail)
                    .maybeSingle();

                  const isRecruiter = activeRole === "recruiter";

                  if (profile) {
                    const profileRole = (profile.role || "candidate").toLowerCase();
                    if (profileRole === "recruiter" && !isRecruiter) {
                      toast("This email is registered as an Employer. Please use the Employer Sign In tab.", "error");
                      setIsLoading(false);
                      return;
                    }
                    if (profileRole === "candidate" && isRecruiter) {
                      toast("This email is registered as a Student. Please use the Student Sign In tab.", "error");
                      setIsLoading(false);
                      return;
                    }
                    localStorage.setItem(
                      "talenthub-session",
                      JSON.stringify({
                        loggedIn: true,
                        email: providerEmail,
                        name: profile.name || (isRecruiter ? "Employer User" : "Candidate User"),
                        role: profileRole,
                      })
                    );
                  } else {
                    toast("No account found. Redirecting to registration page...", "info");
                    router.push(`/register?email=${encodeURIComponent(providerEmail)}&role=${activeRole}`);
                    setIsLoading(false);
                    return;
                  }

                  toast(`Connected with ${provider} as ${isRecruiter ? "Employer" : "Student"}!`, "success");
                  router.push(ROUTES.DASHBOARD);
                } catch (err) {
                  toast((err as Error).message || "Failed to sign in.", "error");
                } finally {
                  setIsLoading(false);
                }
              }}
              type="button"
              className="flex items-center justify-center h-9 border bg-card/50 hover:bg-muted/40 rounded-lg text-[10px] font-bold cursor-pointer transition-colors focus-ring"
            >
              {provider}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <span className="relative bg-background px-3 text-[9px] uppercase font-extrabold tracking-wider text-muted-foreground select-none">
            Or continue with email
          </span>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              {activeRole === "recruiter" ? "Employer Work Email" : "Student Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeRole === "recruiter" ? "recruiter@company.com" : "student@university.edu"}
                className="w-full h-10 border bg-background/50 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground">Password</label>
              <button
                type="button"
                onClick={() => toast("Reset link dispatched to email.", "info")}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>
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
              <span className="flex items-center gap-1">Sign In <ArrowRight className="size-3.5" /></span>
            )}
          </Button>
        </form>

        {/* Footer redirection */}
        <div className="text-center text-xs text-muted-foreground">
          New to TalentHub?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
