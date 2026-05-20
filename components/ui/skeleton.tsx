import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-violet-50 to-slate-100 bg-[length:220%_100%] [animation:skeletonShimmer_1.8s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}
