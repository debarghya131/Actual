import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardAnalyticsLoading() {
  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <div className="rounded-[26px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40 rounded-2xl" />
              <Skeleton className="h-10 w-32 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="mt-6 h-16 w-full rounded-[22px]" />
          <div className="mt-6 flex justify-around">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
          <Skeleton className="mt-8 h-[300px] w-full rounded-2xl" />
        </div>

        <div className="rounded-[26px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)]">
          <Skeleton className="h-6 w-64" />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`analytics-column-${index}`}
                className="rounded-[22px] border border-violet-100/80 bg-white/95 p-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="mt-6 h-[220px] w-full rounded-2xl" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 4 }).map((__, rowIndex) => (
                    <div key={`analytics-row-${index}-${rowIndex}`} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
