import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-100 bg-white/95 p-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-5 h-2 w-full rounded-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`stat-${index}`}
              className="rounded-xl border border-violet-100 bg-white/95 p-4"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-10 w-36" />
              <Skeleton className="mt-4 h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="rounded-xl border border-violet-100 bg-white/95 p-5 xl:col-span-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`tx-${index}`} className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-violet-100 bg-white/95 p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`expense-${index}`} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
