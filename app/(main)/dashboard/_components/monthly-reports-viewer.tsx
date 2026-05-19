"use client";

import { useMemo, useState } from "react";

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

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="border-violet-100 bg-white/95 xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-medium">Monthly Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report) => (
            <button
              key={report.monthKey}
              type="button"
              onClick={() => setSelectedMonthKey(report.monthKey)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition",
                report.monthKey === selectedReport.monthKey
                  ? "border-violet-300 bg-violet-50"
                  : "border-violet-100 bg-white hover:border-violet-200 hover:bg-violet-50/40"
              )}
            >
              <p className="text-sm font-medium text-slate-950">{report.monthLabel}</p>
              <p className="mt-1 text-xs text-violet-950/70">
                {formatCurrency(report.totalExpenses)} spent • {report.transactionCount} txns
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-violet-100 bg-white/95 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {selectedReport.monthLabel} Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Income" value={formatCurrency(selectedReport.totalIncome)} />
            <StatTile label="Expenses" value={formatCurrency(selectedReport.totalExpenses)} />
            <StatTile
              label="Net"
              value={formatCurrency(net)}
              valueClassName={net < 0 ? "text-red-500" : "text-emerald-600"}
            />
          </div>

          <div className="rounded-xl border border-violet-100 p-4">
            <p className="text-sm font-medium text-slate-950">Expense Breakdown</p>
            {selectedReport.categories.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No expenses this month.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedReport.categories.map((category) => (
                  <div key={category.category} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-900">{category.category}</span>
                    <span className="text-violet-950/70">{formatCurrency(category.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-violet-950/65">
            Total transactions: {selectedReport.transactionCount}
          </p>
        </CardContent>
      </Card>
    </div>
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
    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
      <p className="text-xs font-semibold tracking-[0.2em] text-violet-700 uppercase">{label}</p>
      <p className={cn("mt-2 text-xl font-semibold text-slate-950", valueClassName)}>{value}</p>
    </div>
  );
}
