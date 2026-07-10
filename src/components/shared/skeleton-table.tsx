import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("w-full rounded-lg border", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            className={cn(
              "h-4",
              i === 0 ? "w-[200px]" : i === columns - 1 ? "w-[80px] ml-auto" : "w-[120px]"
            )}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn(
                "h-4",
                colIdx === 0
                  ? "w-[180px]"
                  : colIdx === columns - 1
                    ? "w-[60px] ml-auto"
                    : "w-[100px]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
