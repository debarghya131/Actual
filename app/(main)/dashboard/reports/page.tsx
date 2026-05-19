import { format } from "date-fns";
import { redirect } from "next/navigation";

import MonthlyReportsViewer from "@/app/(main)/dashboard/_components/monthly-reports-viewer";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

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

export default async function ReportsPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
    orderBy: {
      date: "desc",
    },
  });

  const reportMap = transactions.reduce<Record<string, MonthlyReportAccumulator>>(
    (acc, transaction) => {
      const monthKey = format(transaction.date, "yyyy-MM");
      const monthLabel = format(transaction.date, "MMMM yyyy");

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

      const amount = Number(transaction.amount);
      acc[monthKey].transactionCount += 1;

      if (transaction.type === "INCOME") {
        acc[monthKey].totalIncome += amount;
      } else {
        acc[monthKey].totalExpenses += amount;
        const category = toCategoryLabel(transaction.category);
        acc[monthKey].byCategory[category] =
          (acc[monthKey].byCategory[category] ?? 0) + amount;
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
      <div className="w-full max-w-7xl space-y-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
            Reports
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Monthly Reports</h1>
          <p className="mt-4 text-base leading-8 text-violet-950/65">
            Reports are generated automatically month by month from your completed transactions.
            Select a month to view detailed income, expenses, and category breakdown.
          </p>
        </div>

        <MonthlyReportsViewer reports={reports} />
      </div>
    </section>
  );
}
