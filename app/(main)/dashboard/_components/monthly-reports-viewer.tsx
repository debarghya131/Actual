"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type MonthlyCategoryStat = {
  category: string;
  amount: number;
};

type MonthlyReportItem = {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  categories: MonthlyCategoryStat[];
};

type MonthlyReportsViewerProps = {
  reports: MonthlyReportItem[];
};

export default function MonthlyReportsViewer({ reports }: MonthlyReportsViewerProps) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(reports[0]?.monthKey ?? "");

  const selectedReport = useMemo(
    () => reports.find((report) => report.monthKey === selectedMonthKey) ?? reports[0],
    [reports, selectedMonthKey]
  );

  if (reports.length === 0) {
    return (
      <Card className="border-violet-100 bg-white/95">
        <CardContent className="p-8 text-center text-muted-foreground">
          No monthly reports yet. Add transactions to generate your first report.
        </CardContent>
      </Card>
    );
  }

  if (!selectedReport) {
    return null;
  }

  const net = selectedReport.totalIncome - selectedReport.totalExpenses;
  const maxCategoryAmount = Math.max(...selectedReport.categories.map((c) => c.amount), 1);
  const topCategory = selectedReport.categories[0];
  const summaryLines = [
    net >= 0
      ? `You finished ${selectedReport.monthLabel} with a surplus of ${formatCurrency(net)}.`
      : `You finished ${selectedReport.monthLabel} with a deficit of ${formatCurrency(Math.abs(net))}.`,
    topCategory
      ? `${topCategory.category} was your biggest expense at ${formatCurrency(topCategory.amount)}.`
      : "No major expense category was recorded this month.",
    `A total of ${selectedReport.transactionCount} transactions were tracked across this report.`,
  ];

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="grid min-w-0 grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.75fr)] xl:items-stretch"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="min-w-0 border-violet-100 bg-white/95 shadow-[0_20px_50px_-36px_rgba(109,40,217,0.3)] transition duration-300 hover:shadow-[0_30px_70px_-34px_rgba(109,40,217,0.42)] xl:min-h-[620px]">
        <CardHeader className="p-4 pb-3 min-[420px]:p-5">
          <CardTitle className="text-base font-medium">Monthly Reports</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 min-[420px]:px-5 xl:max-h-[540px] xl:overflow-y-auto xl:pr-3">
          <div className="space-y-3">
            {reports.map((report) => (
              <button
                key={report.monthKey}
                type="button"
                onClick={() => setSelectedMonthKey(report.monthKey)}
                className={cn(
                  "min-h-16 w-full rounded-xl border px-3 py-3 text-left transition duration-300 min-[420px]:px-4",
                  report.monthKey === selectedReport.monthKey
                    ? "border-violet-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 shadow-[0_18px_42px_-28px_rgba(109,40,217,0.5)] ring-1 ring-violet-300/60"
                    : "border-violet-100 bg-white hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-[0_14px_28px_-24px_rgba(109,40,217,0.3)]"
                )}
              >
                <p className="break-words text-sm font-medium text-slate-950">{report.monthLabel}</p>
                <p className="mt-1 text-xs text-violet-950/70">
                  {formatCurrency(report.totalExpenses)} spent • {report.transactionCount} txns
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      </m.div>

      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="min-w-0 border-violet-100 bg-white/95 shadow-[0_20px_50px_-36px_rgba(109,40,217,0.3)] transition duration-300 hover:shadow-[0_30px_70px_-34px_rgba(109,40,217,0.42)] xl:min-h-[540px]">
        <CardHeader className="p-4 pb-3 min-[420px]:p-5">
          <CardTitle className="text-base font-medium">
            {selectedReport.monthLabel} Report
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 space-y-5 px-4 pb-4 min-[420px]:px-5 min-[420px]:pb-5">
          <div className="grid min-w-0 gap-3 min-[560px]:grid-cols-3">
            <StatTile label="Income" value={formatCurrency(selectedReport.totalIncome)} />
            <StatTile label="Expenses" value={formatCurrency(selectedReport.totalExpenses)} />
            <StatTile
              label="Net"
              value={formatCurrency(net)}
              valueClassName={net < 0 ? "text-red-500" : "text-emerald-600"}
            />
          </div>

          <div className="min-w-0 rounded-xl border border-violet-100 p-3 transition duration-300 hover:shadow-[0_14px_30px_-24px_rgba(109,40,217,0.34)] min-[420px]:p-4">
            <p className="text-sm font-medium text-slate-950">Expense Breakdown</p>
            {selectedReport.categories.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No expenses this month.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedReport.categories.map((category, index) => {
                  const progressPercent = Math.max(
                    8,
                    Math.min((category.amount / maxCategoryAmount) * 100, 100)
                  );

                  return (
                    <div key={category.category} className="min-w-0 space-y-1.5 text-sm">
                      <div className="flex min-w-0 flex-col gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-3">
                        <span className="min-w-0 break-words font-medium text-slate-900">{category.category}</span>
                        <span className="shrink-0 text-violet-950/70">{formatCurrency(category.amount)}</span>
                      </div>
                      <m.div
                        className="relative h-1.5 overflow-hidden rounded-full bg-violet-100"
                        initial={{ opacity: 0, scaleX: 0.82 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: "left center" }}
                      >
                        <m.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 shadow-[0_0_16px_rgba(139,92,246,0.42)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.65, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <m.div
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                          animate={{ x: ["-120%", "650%"] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                        />
                      </m.div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-violet-950/65">
            Total transactions: {selectedReport.transactionCount}
          </p>
        </CardContent>
      </Card>
      </m.div>

      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="min-w-0 border-violet-100 bg-white/95 shadow-[0_20px_50px_-36px_rgba(109,40,217,0.3)] transition duration-300 hover:shadow-[0_30px_70px_-34px_rgba(109,40,217,0.42)] xl:min-h-[540px]">
        <CardHeader className="p-4 pb-3 min-[420px]:p-5">
          <CardTitle className="text-base font-medium">AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col justify-start px-4 pb-4 min-[420px]:px-5 min-[420px]:pb-5 xl:h-full">
          <div className="relative flex min-w-0 flex-col items-start gap-3 overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/35 p-3 transition duration-300 hover:shadow-[0_16px_36px_-26px_rgba(109,40,217,0.42)] min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-4 min-[420px]:p-4 xl:flex-col xl:items-start min-[1800px]:flex-row min-[1800px]:items-center">
            <m.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/55 to-transparent"
              animate={{ x: ["-130%", "740%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <Image
              src="/kuberlogo.webp"
              alt="Kuber logo"
              width={64}
              height={64}
              sizes="64px"
              className="h-14 w-14 shrink-0 rounded-sm object-contain min-[420px]:h-16 min-[420px]:w-16"
              style={{ imageRendering: "auto" }}
            />
            <div className="min-w-0">
              <p className="break-words text-lg font-semibold leading-snug text-slate-950">Kubera Summary</p>
              <p className="mt-1 text-sm text-violet-950/65">
                Focused monthly financial takeaway.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-violet-100 bg-white p-3 min-[420px]:mt-5 min-[420px]:p-4">
            {summaryLines.map((line) => (
              <p key={line} className="break-words text-sm leading-7 text-violet-950/72">
                {line}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
      </m.div>
    </m.div>
    </LazyMotion>
  );
}

function StatTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/40 p-3 min-[420px]:p-4">
      <p className="break-words text-xs font-semibold tracking-[0.16em] text-violet-700 uppercase">{label}</p>
      <p className={cn("mt-2 break-words text-lg font-semibold leading-snug text-slate-950 min-[420px]:text-xl", valueClassName)}>{value}</p>
    </div>
  );
}
