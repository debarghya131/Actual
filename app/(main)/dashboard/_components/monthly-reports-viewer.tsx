"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { FileText, Layers, List, Sparkles } from "lucide-react";

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
  const [mobileSection, setMobileSection] = useState<"months" | "report" | "summary">("months");

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
    {
      title: "Net Savings Balance",
      text:
        net >= 0
          ? `You finished ${selectedReport.monthLabel} with a surplus of ${formatCurrency(net)}.`
          : `You finished ${selectedReport.monthLabel} with a deficit of ${formatCurrency(Math.abs(net))}.`,
      positive: net >= 0,
    },
    {
      title: "Top Expense Driver",
      text: topCategory
        ? `${topCategory.category} was your largest expenditure, totaling ${formatCurrency(topCategory.amount)}.`
        : "No significant category spending was logged for this period.",
      positive: true,
    },
    {
      title: "Activity Volume",
      text: `${selectedReport.transactionCount} transactions were tracked and analyzed across your accounts.`,
      positive: true,
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="flex flex-1 flex-col min-w-0 min-h-0 lg:h-full lg:min-h-0 xl:grid xl:grid-cols-3 xl:items-stretch gap-3.5 sm:gap-4 md:gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile Section Tabs */}
        <div className="col-span-full grid grid-cols-3 gap-1 rounded-2xl border border-violet-100 bg-white/90 p-1 shadow-2xs xl:hidden shrink-0">
          {([
            ["months", "Month List", List],
            ["report", "Report Details", FileText],
            ["summary", "AI Summary", Sparkles],
          ] as const).map(([section, label, Icon]) => (
            <button
              key={section}
              type="button"
              aria-pressed={mobileSection === section}
              onClick={() => setMobileSection(section)}
              className={cn(
                "flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-1 text-xs font-semibold leading-tight transition",
                mobileSection === section
                  ? "bg-violet-700 text-white shadow-xs"
                  : "text-violet-800 hover:bg-violet-50"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* Card 1: Month List */}
        <m.div
          className={cn(
            "flex min-w-0 flex-col xl:h-full xl:min-h-0",
            mobileSection === "months" ? "flex" : "hidden xl:flex"
          )}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100/70 text-violet-700 shadow-xs">
                  <List className="h-3.5 w-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    Monthly Reports
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {reports.length} statements generated
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden p-2.5 sm:p-3">
              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 sm:pr-2 modern-scrollbar max-h-[380px] xl:max-h-none">
                {reports.map((report) => (
                  <button
                    key={report.monthKey}
                    type="button"
                    onClick={() => {
                      setSelectedMonthKey(report.monthKey);
                      setMobileSection("report");
                    }}
                    className={cn(
                      "w-full rounded-xl border p-2.5 sm:p-3 text-left transition duration-200",
                      report.monthKey === selectedReport.monthKey
                        ? "border-violet-300/90 bg-gradient-to-r from-violet-50/90 to-fuchsia-50/80 shadow-xs ring-1 ring-violet-300/50"
                        : "border-violet-100/80 bg-white hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-2xs"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                        {report.monthLabel}
                      </p>
                      {report.monthKey === selectedReport.monthKey ? (
                        <span className="h-2 w-2 rounded-full bg-violet-600 shrink-0" />
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{formatCurrency(report.totalExpenses)} spent</span>
                      <span>{report.transactionCount} txns</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Card 2: Report Details */}
        <m.div
          className={cn(
            "flex min-w-0 flex-col xl:h-full xl:min-h-0",
            mobileSection === "report" ? "flex" : "hidden xl:flex"
          )}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100/70 text-violet-700 shadow-xs">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    {selectedReport.monthLabel} Report
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {selectedReport.categories.length} categories logged
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 min-h-0 flex-col p-2.5 sm:p-3 overflow-hidden gap-2.5 sm:gap-3">
              {/* 3 Metrics: Income, Expenses, Net */}
              <div className="grid grid-cols-3 gap-2 shrink-0">
                <StatTile label="Income" value={formatCurrency(selectedReport.totalIncome)} />
                <StatTile label="Expenses" value={formatCurrency(selectedReport.totalExpenses)} />
                <StatTile
                  label="Net"
                  value={formatCurrency(net)}
                  valueClassName={net < 0 ? "text-rose-500" : "text-emerald-600"}
                />
              </div>

              {/* Expense Breakdown List */}
              <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-violet-100/80 bg-white p-2.5 sm:p-3 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-violet-600" />
                    Expense Breakdown
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">By Volume</span>
                </div>

                {selectedReport.categories.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-6 text-center text-xs text-slate-400">
                    No expenses logged for this month.
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 sm:pr-1.5 modern-scrollbar max-h-[300px] xl:max-h-none">
                    {selectedReport.categories.map((category) => {
                      const progressPercent = Math.max(
                        6,
                        Math.min((category.amount / maxCategoryAmount) * 100, 100)
                      );

                      return (
                        <div key={category.category} className="space-y-1 rounded-lg p-1.5 transition hover:bg-violet-50/40">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="truncate capitalize text-slate-800">{category.category}</span>
                            <span className="font-semibold text-slate-900 shrink-0">{formatCurrency(category.amount)}</span>
                          </div>
                          <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 shadow-xs transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center justify-between text-[11px] font-medium text-slate-400 px-1">
                <span>Total transactions: {selectedReport.transactionCount}</span>
                <span>Sorted by highest expense</span>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Card 3: AI Summary */}
        <m.div
          className={cn(
            "flex min-w-0 flex-col xl:h-full xl:min-h-0",
            mobileSection === "summary" ? "flex" : "hidden xl:flex"
          )}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100/70 text-violet-700 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    AI Summary
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Automated monthly financial analysis
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 min-h-0 flex-col p-2.5 sm:p-3.5 overflow-y-auto modern-scrollbar gap-2.5 sm:gap-3">
              {/* Kubera Banner Box */}
              <div className="flex items-center gap-3 rounded-xl border border-violet-100/90 bg-violet-50/40 p-2.5 sm:p-3 shrink-0">
                <Image
                  src="/kuberlogo.webp"
                  alt="Kubera logo"
                  width={52}
                  height={52}
                  sizes="52px"
                  className="h-11 w-11 shrink-0 rounded-lg object-contain"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Kubera Summary
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Focused monthly financial takeaway.
                  </p>
                </div>
              </div>

              {/* Summary Takeaway Cards */}
              <div className="space-y-2 flex-1">
                {summaryLines.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-violet-100/80 bg-white p-2.5 sm:p-3 shadow-2xs space-y-1"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                      {item.title}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {item.text}
                    </p>
                  </div>
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
    <div className="min-w-0 rounded-xl border border-violet-100/80 bg-violet-50/40 p-2 sm:p-2.5 text-center">
      <p className="truncate text-[10px] font-bold tracking-wider text-violet-700 uppercase">{label}</p>
      <p className={cn("mt-1 truncate text-xs sm:text-sm font-bold tracking-tight text-slate-900", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
