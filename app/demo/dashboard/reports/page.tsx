import { format } from "date-fns";

import MonthlyReportsViewer from "@/app/(main)/dashboard/_components/monthly-reports-viewer";
import { demoTransactions } from "@/lib/demo-data";

type MonthlyReportAccumulator = {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  byCategory: Record<string, number>;
};

function toCategoryLabel(category: string | null) {
  const value = (category ?? "uncategorized").trim();
  if (!value) {
    return "Uncategorized";
  }

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function DemoReportsPage() {
  const reportMap = demoTransactions.reduce<Record<string, MonthlyReportAccumulator>>(
    (acc, transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthKey = format(transactionDate, "yyyy-MM");
      const monthLabel = format(transactionDate, "MMMM yyyy");

      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthKey,
          monthLabel,
          totalIncome: 0,
          totalExpenses: 0,
          transactionCount: 0,
          byCategory: {},
        };
      }

      acc[monthKey].transactionCount += 1;

      if (transaction.type === "INCOME") {
        acc[monthKey].totalIncome += transaction.amount;
      } else {
        acc[monthKey].totalExpenses += transaction.amount;
        const category = toCategoryLabel(transaction.category);
        acc[monthKey].byCategory[category] =
          (acc[monthKey].byCategory[category] ?? 0) + transaction.amount;
      }

      return acc;
    },
    {}
  );

  const reports = Object.values(reportMap)
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    .map((report) => ({
      monthKey: report.monthKey,
      monthLabel: report.monthLabel,
      totalIncome: Number(report.totalIncome.toFixed(2)),
      totalExpenses: Number(report.totalExpenses.toFixed(2)),
      transactionCount: report.transactionCount,
      categories: Object.entries(report.byCategory)
        .map(([category, amount]) => ({
          category,
          amount: Number(amount.toFixed(2)),
        }))
        .sort((a, b) => b.amount - a.amount),
    }));

  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1500px] space-y-8">
        <MonthlyReportsViewer reports={reports} />
      </div>
    </section>
  );
}
