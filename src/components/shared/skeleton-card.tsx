import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
  showImage?: boolean;
}

export function SkeletonCard({
  className,
  lines = 3,
  showHeader = true,
  showImage = false,
}: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {showImage && <Skeleton className="h-48 w-full rounded-none" />}
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
      )}
      <CardContent className={cn(!showHeader && "pt-6")}>
        <div className="space-y-2.5">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-3",
                i === lines - 1 ? "w-4/5" : "w-full"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
