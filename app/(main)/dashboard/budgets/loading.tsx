import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsLoading() {
  return (
    <section className="min-h-full w-full">
      <div className="w-full rounded-[28px] border border-violet-100/90 bg-white/92 p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-12">
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <div
              key={`budget-loading-card-${cardIndex}`}
              className="space-y-5 rounded-2xl border border-violet-100 bg-white/90 p-5 xl:col-span-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((__, rowIndex) => (
                  <div key={`budget-loading-row-${cardIndex}-${rowIndex}`} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
