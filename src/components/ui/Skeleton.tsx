import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-theme-surface/30 rounded-xl",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
};

export const RadioCardSkeleton = () => (
  <div className="bg-theme-surface rounded-[2rem] p-5 flex items-center gap-4 animate-pulse border border-theme-border shadow-sm">
    <Skeleton className="w-16 h-16 shrink-0 bg-theme-text-primary/5" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-theme-text-primary/5" />
      <Skeleton className="h-3 w-1/4 bg-theme-text-primary/5 opacity-50" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-3 w-12 bg-theme-text-primary/5 rounded-md" />
        <Skeleton className="h-3 w-12 bg-theme-text-primary/5 rounded-md" />
      </div>
    </div>
    <Skeleton className="w-10 h-10 rounded-full bg-theme-text-primary/5" />
  </div>
);
