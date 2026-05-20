import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1500px]">
        <div className="grid gap-5 xl:grid-cols-12">
          <div className="rounded-xl border border-violet-100 bg-white/95 p-4 xl:col-span-4">
            <Skeleton className="h-6 w-36" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`report-month-${i}`} className="rounded-xl border border-violet-100 p-4">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="mt-2 h-4 w-36" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-violet-100 bg-white/95 p-4 xl:col-span-5">
            <Skeleton className="h-6 w-44" />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`report-stat-${i}`} className="rounded-xl border border-violet-100 p-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-3 h-7 w-28" />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-violet-100 p-4">
              <Skeleton className="h-5 w-36" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={`report-row-${i}`} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-violet-100 bg-white/95 p-4 xl:col-span-3">
            <Skeleton className="h-6 w-24" />
            <div className="mt-4 rounded-2xl border border-violet-100 p-4">
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="mt-5 space-y-3 rounded-2xl border border-violet-100 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[88%]" />
              <Skeleton className="h-4 w-[86%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
