import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardTransactionCreateLoading() {
  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1680px] rounded-[28px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] sm:p-8">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-violet-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-[28rem] max-w-full" />
            </div>
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>

          <div className="rounded-[22px] border border-emerald-200/70 bg-white/80 p-4">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Skeleton className="h-11 flex-1 rounded-2xl" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-11 w-40 rounded-2xl" />
                <Skeleton className="h-11 w-32 rounded-2xl" />
                <Skeleton className="h-11 w-32 rounded-2xl" />
              </div>
            </div>

            <div className="rounded-[22px] border border-violet-100 bg-white/95 p-4">
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={`row-${index}`} className="grid grid-cols-[1fr_1.2fr_0.9fr_0.8fr] gap-4">
                    <Skeleton className="h-5 rounded-lg" />
                    <Skeleton className="h-5 rounded-lg" />
                    <Skeleton className="h-5 rounded-lg" />
                    <Skeleton className="h-5 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
