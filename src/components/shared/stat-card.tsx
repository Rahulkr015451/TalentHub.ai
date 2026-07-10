import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: StatCardProps) {
  const TrendIcon =
    changeType === "increase"
      ? TrendingUp
      : changeType === "decrease"
        ? TrendingDown
        : Minus;

  const trendColor =
    changeType === "increase"
      ? "text-success"
      : changeType === "decrease"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="size-3" />
            <span>{Math.abs(change)}%</span>
            <span className="text-muted-foreground font-normal">
              vs last month
            </span>
          </div>
        )}
      </CardContent>
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}
