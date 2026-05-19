"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type DashboardAccount = {
  id: string;
  name: string;
  isDefault: boolean;
};

type DashboardTransaction = {
  id: string;
  accountId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  date: string;
  category: string;
};

type DashboardOverviewProps = {
  accounts: DashboardAccount[];
  transactions: DashboardTransaction[];
};

const GOAL_STORAGE_KEY = "budget-savings-goal";
const UPCOMING_GOALS_STORAGE_KEY = "budget-upcoming-goal-targets";

export function DashboardOverview({
  accounts,
  transactions,
}: DashboardOverviewProps) {
  const currentMonthKey = format(new Date(), "yyyy-MM");
  const [savingsGoalTarget] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    const storedGoals = window.localStorage.getItem(UPCOMING_GOALS_STORAGE_KEY);
    const parsedGoals = storedGoals
      ? (JSON.parse(storedGoals) as Record<string, string>)
      : {};
    const currentMonthGoal = parsedGoals[currentMonthKey];
    const fallbackGoal = window.localStorage.getItem(GOAL_STORAGE_KEY);
    const resolvedGoal = Number(currentMonthGoal || fallbackGoal || 0);

    return Number.isFinite(resolvedGoal) ? resolvedGoal : 0;
  });
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? "",
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const currentMonthTransactions = transactions.filter(
    (transaction) => format(new Date(transaction.date), "yyyy-MM") === currentMonthKey,
  );
  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const monthlyExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const savingsRate =
    monthlyIncome > 0
      ? Math.max(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100, 0)
      : 0;
  const currentSavings = Math.max(monthlyIncome - monthlyExpenses, 0);
  const savingsGoalProgress =
    savingsGoalTarget > 0
      ? Math.min((currentSavings / savingsGoalTarget) * 100, 100)
      : 0;

  const accountTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccountId,
  );

  const recentTransactions = [...accountTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const monthOptions = Array.from(
    new Map(
      [selectedMonth, currentMonthKey, ...accountTransactions.map((transaction) =>
        format(new Date(transaction.date), "yyyy-MM")
      )].map((monthKey) => [
        monthKey,
        {
          value: monthKey,
          label: format(new Date(`${monthKey}-01T00:00:00`), "MMMM yyyy"),
        },
      ])
    ).values()
  ).sort((a, b) => b.value.localeCompare(a.value));

  const selectedMonthExpenses = accountTransactions.filter((transaction) => {
    return (
      transaction.type === "EXPENSE" &&
      format(new Date(transaction.date), "yyyy-MM") === selectedMonth
    );
  });

  const expensesByCategory = selectedMonthExpenses.reduce<Record<string, number>>(
    (totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] ?? 0) + transaction.amount;
      return totals;
    },
    {},
  );

  const expenseBreakdown = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  const totalExpenses = expenseBreakdown.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="px-1 text-base font-normal text-slate-950">
          This Month Overview
        </h2>
        <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-violet-100 bg-white/95">
            <CardContent className="flex min-h-24 flex-col justify-center p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Overall Income
              </div>
              <p className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950">
                {formatCurrency(monthlyIncome)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-white/95">
            <CardContent className="flex min-h-24 flex-col justify-center p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Overall Expenses
              </div>
              <p className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950">
                {formatCurrency(monthlyExpenses)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-white/95 md:col-span-2 xl:col-span-1">
            <CardContent className="flex min-h-24 flex-col justify-center p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
                <PiggyBank className="h-4 w-4 text-violet-700" />
                Saving Rate
              </div>
              <p className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950">
                {savingsRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-white/95 md:col-span-2 xl:col-span-1">
            <CardContent className="flex min-h-24 flex-col justify-center p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
                <Target className="h-4 w-4 text-violet-700" />
                Goal Progress
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-[2rem] font-semibold tracking-tight text-slate-950">
                  {savingsGoalProgress.toFixed(1)}%
                </p>
                <p className="text-right text-xs font-medium text-violet-700">
                  {savingsGoalTarget > 0
                    ? `Current month goal ${formatCurrency(savingsGoalTarget)}`
                    : "No current month goal"}
                </p>
              </div>
              <div className="mt-3 space-y-1">
                <Progress
                  value={savingsGoalProgress}
                  className="h-1.5"
                  extraStyles={
                    savingsGoalProgress >= 100
                      ? "bg-emerald-500"
                      : savingsGoalProgress >= 70
                        ? "bg-violet-600"
                        : "bg-amber-500"
                  }
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(currentSavings)} saved
                  </span>
                  <span className="font-medium text-violet-700">
                    {savingsGoalTarget > 0
                      ? `${formatCurrency(Math.max(savingsGoalTarget - currentSavings, 0))} to go`
                      : "Set from Budget"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-5">
        <Card className="h-full xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-4">
            <CardTitle className="text-base font-normal">
              Recent Transactions
            </CardTitle>
            {accounts.length > 0 ? (
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="max-h-[340px] space-y-3 overflow-y-auto pr-2">
              {recentTransactions.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No recent transactions
                </p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium leading-none">
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex shrink-0 items-center text-sm font-medium",
                        transaction.type === "EXPENSE"
                          ? "text-red-500"
                          : "text-green-500",
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      )}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-5 pb-4">
            <CardTitle className="text-base font-normal">
              Monthly Expense Breakdown
            </CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[155px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {expenseBreakdown.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No expenses for this month
              </p>
            ) : (
              <div className="max-h-[340px] space-y-3 overflow-y-auto pr-2">
                {expenseBreakdown.map((expense) => {
                  const percent =
                    totalExpenses > 0 ? (expense.amount / totalExpenses) * 100 : 0;

                  return (
                    <div key={expense.category} className="space-y-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium">{expense.category}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-violet-600"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default DashboardOverview;
