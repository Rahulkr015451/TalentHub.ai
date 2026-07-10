"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  CheckCircle2,
  Users,
  CreditCard,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { getCompanyById, updateCompanyProfile } from "@/lib/supabase/data-access";
import { useToast } from "@/components/shared/toast";

// --- MOCK MEMBERS ---
const MOCK_MEMBERS = [
  { name: "Sarah Jenkins", email: "sarah.j@stripe.com", role: "Manager / Owner" },
  { name: "Michael K.", email: "m.k@stripe.com", role: "Standard Recruiter" },
  { name: "Alex Rivera", email: "alex.r@stripe.com", role: "Interviewer" },
];

export default function OrganizationPage() {
  const [orgName, setOrgName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("1000+");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const stripeCompanyId = "c0000001-0000-0000-0000-000000000004"; // Default Stripe

  useEffect(() => {
    async function loadCompanyDetails() {
      setIsLoading(true);
      try {
        const { data, error } = await getCompanyById(stripeCompanyId);
        if (error) throw error;
        if (data) {
          setOrgName(data.name || "");
          setWebsite(data.website || "");
          setIndustry(data.industry || "");
          setSize(data.size || "1000+");
        }
      } catch (err) {
        toast((err as Error).message || "Failed to load company details", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadCompanyDetails();
  }, [toast]);

  const handleSave = async () => {
    if (!orgName.trim()) {
      toast("Organization name cannot be empty", "error");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateCompanyProfile(stripeCompanyId, {
        name: orgName,
        website,
        industry,
        size,
      });
      if (error) throw error;
      toast("Organization settings updated successfully!", "success");
    } catch (err) {
      toast((err as Error).message || "Failed to update organization settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Organization Settings"
        description="Configure tenant company parameters, manage recruiter seats allocations, and view subscription details."
      />

      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* LEFT COLUMN: MAIN PROFILE FORM (7/12 cols) */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="size-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <div className="border-b pb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <Building className="size-4.5 text-primary" /> Company Credentials
                    </h4>
                    <p className="text-[10px] text-muted-foreground">These details populate job search cards and verified profile lists.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Organization Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full h-10 border bg-card rounded-lg px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Corporate Website</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full h-10 border bg-card rounded-lg px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    {/* Industry & Size */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Industry Category</label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full h-10 border bg-card rounded-lg px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Employee Count</label>
                        <select
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          className="w-full h-10 border bg-card rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="1-10">1 - 10 employees</option>
                          <option value="10-50">10 - 50 employees</option>
                          <option value="50-250">50 - 250 employees</option>
                          <option value="250-1000">250 - 1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-4 border-t">
                    <Button className="h-10 text-xs bg-primary flex-1 gap-1.5" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ACTIVE TEAM MEMBERS LIST */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <Users className="size-4.5 text-primary" /> Seat Access allocations
                </span>
                <Badge variant="outline" className="text-[9px] font-bold">3 of 5 Seats Filled</Badge>
              </div>

              <div className="space-y-3">
                {MOCK_MEMBERS.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground">{member.name}</span>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="size-3" /> {member.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: SUBSCRIPTION BILLING INFO (5/12 cols) */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 border-b pb-2">
                <CreditCard className="size-4" /> Subscription & Plan
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Plan</span>
                  <Badge className="bg-primary text-primary-foreground font-bold">TalentHub Pro Enterprise</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Billing Cycle</span>
                  <span className="font-semibold">Yearly ($2,400/yr)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Invoice</span>
                  <span className="font-semibold">December 15, 2026</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t">
                  <span className="text-muted-foreground">Verification Badge</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-[9px] font-bold">
                    <CheckCircle2 className="size-3 mr-1 fill-emerald-500 text-neutral-950" /> VERIFIED
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
