"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Layers,
  PiggyBank,
  Receipt,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
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
  category: string | null;
};

type DashboardOverviewProps = {
  accounts: DashboardAccount[];
  transactions: DashboardTransaction[];
  referenceMonthKey?: string;
  preferences: {
    savingsGoalTargets: Record<string, string>;
    categoryTargetsByMonth: Record<string, Record<string, string>>;
  };
};

function normalizeCategoryKey(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized || "uncategorized";
}

export function DashboardOverview({
  accounts,
  transactions,
  referenceMonthKey,
  preferences,
}: DashboardOverviewProps) {
  const now = new Date();
  const currentMonthKey = referenceMonthKey ?? format(now, "yyyy-MM");
  const overviewTitle = referenceMonthKey
    ? `${format(new Date(`${referenceMonthKey}-01T00:00:00`), "MMMM yyyy")} Overview`
    : "This Month Overview";
  const parsedGoalTarget = Number(preferences.savingsGoalTargets[currentMonthKey] || 0);
  const savingsGoalTarget = Number.isFinite(parsedGoalTarget) ? parsedGoalTarget : 0;
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? "",
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const categoryTargetsForMonth = useMemo(
    () => preferences.categoryTargetsByMonth[selectedMonth] ?? {},
    [preferences.categoryTargetsByMonth, selectedMonth],
  );

  const currentMonthTransactions = transactions.filter(
    (transaction) => format(new Date(transaction.date), "yyyy-MM") === currentMonthKey,
  );

  const monthlyIncome = sumTransactionsByType(currentMonthTransactions, "INCOME");
  const monthlyExpenses = sumTransactionsByType(currentMonthTransactions, "EXPENSE");
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
      [selectedMonth, currentMonthKey, ...transactions.map((transaction) =>
        format(new Date(transaction.date), "yyyy-MM")
      )].map((monthKey) => [
        monthKey,
        {
          value: monthKey,
          label: format(new Date(`${monthKey}-01T00:00:00`), "MMMM yyyy"),
        },
      ]),
    ).values(),
  ).sort((a, b) => b.value.localeCompare(a.value));

  const selectedMonthExpenses = transactions.filter((transaction) => {
    return (
      transaction.type === "EXPENSE" &&
      format(new Date(transaction.date), "yyyy-MM") === selectedMonth
    );
  });

  const expensesByCategory = selectedMonthExpenses.reduce<Record<string, number>>(
    (totals, transaction) => {
      const categoryKey = normalizeCategoryKey(transaction.category);
      totals[categoryKey] = (totals[categoryKey] ?? 0) + transaction.amount;
      return totals;
    },
    {},
  );

  const labelByCategory = selectedMonthExpenses.reduce<Record<string, string>>(
    (labels, transaction) => {
      const key = normalizeCategoryKey(transaction.category);
      labels[key] = transaction.category ?? "Uncategorized";
      return labels;
    },
    {},
  );

  const targetByCategory = Object.entries(categoryTargetsForMonth).reduce<
    Record<string, number>
  >((targets, [category, target]) => {
    const amount = Number(target);
    if (Number.isFinite(amount) && amount > 0) {
      targets[normalizeCategoryKey(category)] = amount;
    }
    return targets;
  }, {});

  const expenseBreakdown = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      label: labelByCategory[category] ?? category,
      amount,
      target: targetByCategory[category] ?? 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        className="flex min-w-0 flex-1 flex-col lg:h-full lg:min-h-0 space-y-3 sm:space-y-3.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header & 4 Stat Cards */}
        <div className="shrink-0 min-w-0 space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-900 uppercase">
                {overviewTitle}
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-700 bg-violet-50/90 px-2.5 py-0.5 rounded-full border border-violet-100 shadow-xs">
              <Sparkles className="h-3 w-3 text-violet-600" />
              Financial Pulse
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
            <StatCard
              title="Overall Income"
              icon={TrendingUp}
              iconBg="bg-emerald-50 text-emerald-600 border-emerald-200/60"
              subText={
                <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" /> Monthly Inflow
                </span>
              }
              value={formatCurrency(monthlyIncome)}
            />

            <StatCard
              title="Overall Expenses"
              icon={TrendingDown}
              iconBg="bg-rose-50 text-rose-600 border-rose-200/60"
              subText={
                <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-rose-500">
                  <ArrowDownRight className="h-3 w-3" /> Monthly Outflow
                </span>
              }
              value={formatCurrency(monthlyExpenses)}
            />

            <StatCard
              title="Saving Rate"
              icon={PiggyBank}
              iconBg="bg-violet-50 text-violet-700 border-violet-200/60"
              subText={
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-semibold",
                    savingsRate >= 20 ? "text-violet-600" : "text-amber-600"
                  )}
                >
                  {savingsRate >= 20 ? "Healthy (>20%)" : "Low reserves"}
                </span>
              }
              value={`${savingsRate.toFixed(1)}%`}
            />

            <m.div
              whileHover={{ y: -3, scale: 1.005 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-w-0"
            >
              <Card className="min-w-0 border-violet-100/90 bg-white/95 shadow-[0_12px_32px_-20px_rgba(109,40,217,0.18)] backdrop-blur-md transition duration-300 hover:border-violet-200 hover:shadow-[0_16px_40px_-18px_rgba(109,40,217,0.28)]">
                <CardContent className="flex flex-col justify-between p-2.5 min-[380px]:p-3 sm:p-3.5 min-h-[96px] sm:min-h-[104px] gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/60 bg-fuchsia-50 text-fuchsia-600 shadow-xs">
                      <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                    <span className="truncate text-xs font-semibold text-slate-700">Goal Progress</span>
                  </div>

                  <p className="truncate text-base min-[380px]:text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                    {savingsGoalProgress.toFixed(1)}%
                  </p>

                  <div className="space-y-1">
                    <div className="relative overflow-hidden rounded-full">
                      <Progress
                        value={savingsGoalProgress}
                        className="h-1.5 bg-slate-100"
                        extraStyles={cn(
                          "rounded-full transition-all duration-500",
                          savingsGoalProgress >= 100
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                            : savingsGoalProgress >= 70
                              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(109,40,217,0.35)]"
                              : "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.28)]"
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 gap-1">
                      <span className="text-emerald-600 font-semibold truncate">
                        {formatCurrency(currentSavings)} saved
                      </span>
                      <span className="text-slate-400 truncate">
                        {savingsGoalTarget > 0
                          ? currentSavings >= savingsGoalTarget
                            ? "Goal reached!"
                            : `${formatCurrency(savingsGoalTarget - currentSavings)} to go`
                          : "Set in Budget"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          </div>
        </div>

        {/* Bottom Split Section: Recent Transactions & Monthly Expense Breakdown */}
        <div className="grid min-w-0 flex-1 gap-3.5 sm:gap-4 xl:grid-cols-5 lg:min-h-0 items-stretch">
          {/* Recent Transactions */}
          <m.div
            className="flex h-full min-w-0 flex-col xl:col-span-3 lg:min-h-0"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Card className="flex h-full min-w-0 flex-col overflow-hidden border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md transition duration-300 hover:border-violet-200 hover:shadow-[0_20px_48px_-20px_rgba(109,40,217,0.26)]">
              <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-2.5 sm:px-4 sm:py-3 shrink-0 space-y-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100/70 text-violet-700 shadow-xs">
                    <Receipt className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                      Recent Transactions
                    </CardTitle>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {recentTransactions.length} recorded
                    </p>
                  </div>
                </div>

                {accounts.length > 0 ? (
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="h-8 w-auto min-w-[110px] sm:min-w-[130px] rounded-full border-violet-200/80 bg-violet-50/60 px-2.5 text-xs font-semibold text-violet-800 shadow-xs transition hover:border-violet-300 hover:bg-violet-100/70">
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

              <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden p-2 sm:p-3">
                <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1 sm:pr-2 modern-scrollbar max-h-[340px] sm:max-h-[380px] lg:max-h-none">
                  {recentTransactions.length === 0 ? (
                    <div className="flex h-full min-h-[140px] flex-col items-center justify-center py-8 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-400 mb-2">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-600">No recent transactions</p>
                      <p className="text-[11px] text-slate-400">Transactions will appear here</p>
                    </div>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <m.div
                        key={transaction.id}
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-transparent p-2 sm:p-2.5 transition duration-200 hover:border-violet-100 hover:bg-violet-50/50 hover:shadow-xs"
                      >
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl shadow-xs transition",
                              transaction.type === "EXPENSE"
                                ? "bg-rose-50 text-rose-500 group-hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                            )}
                          >
                            {transaction.type === "EXPENSE" ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p
                              className="truncate text-xs sm:text-sm font-semibold text-slate-900 leading-tight"
                              title={transaction.description || "Untitled Transaction"}
                            >
                              {transaction.description || "Untitled Transaction"}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              {transaction.category ? (
                                <span className="inline-block max-w-[110px] truncate rounded bg-violet-100/70 px-1.5 py-0.2 text-[10px] font-semibold text-violet-700 capitalize">
                                  {transaction.category}
                                </span>
                              ) : null}
                              <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "shrink-0 text-right text-xs sm:text-sm font-bold tracking-tight",
                            transaction.type === "EXPENSE" ? "text-rose-500" : "text-emerald-600"
                          )}
                        >
                          {transaction.type === "EXPENSE" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </m.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </m.div>

          {/* Monthly Expense Breakdown */}
          <m.div
            className="flex h-full min-w-0 flex-col xl:col-span-2 lg:min-h-0"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Card className="flex h-full min-w-0 flex-col overflow-hidden border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md transition duration-300 hover:border-violet-200 hover:shadow-[0_20px_48px_-20px_rgba(109,40,217,0.26)]">
              <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-2.5 sm:px-4 sm:py-3 shrink-0 space-y-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100/70 text-violet-700 shadow-xs">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                      Expense Breakdown
                    </CardTitle>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {expenseBreakdown.length} categories
                    </p>
                  </div>
                </div>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-8 w-auto min-w-[120px] sm:min-w-[140px] rounded-full border-violet-200/80 bg-violet-50/60 px-2.5 text-xs font-semibold text-violet-800 shadow-xs transition hover:border-violet-300 hover:bg-violet-100/70">
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

              <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden p-2 sm:p-3">
                {expenseBreakdown.length === 0 ? (
                  <div className="flex h-full min-h-[140px] flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-400 mb-2">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-slate-600">No expenses recorded</p>
                    <p className="text-[11px] text-slate-400">Select another month or add expenses</p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 sm:pr-2 modern-scrollbar max-h-[340px] sm:max-h-[380px] lg:max-h-none">
                    {expenseBreakdown.map((expense) => {
                      const usagePercent =
                        expense.target > 0 ? (expense.amount / expense.target) * 100 : 0;
                      const progressPercent =
                        expense.target > 0 ? Math.min(usagePercent, 100) : 100;
                      const isOverTarget = expense.target > 0 && expense.amount > expense.target;
                      const isNearingTarget = usagePercent >= 80 && usagePercent <= 100;

                      return (
                        <m.div
                          key={expense.category}
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="space-y-1.5 rounded-xl border border-transparent p-2 sm:p-2.5 transition duration-200 hover:border-violet-100 hover:bg-violet-50/40 hover:shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full shrink-0",
                                  isOverTarget
                                    ? "bg-rose-500"
                                    : isNearingTarget
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                )}
                              />
                              <span className="truncate font-semibold capitalize text-slate-800">
                                {expense.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {formatCurrency(expense.amount)}
                              </span>
                              {expense.target > 0 ? (
                                <span
                                  className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.2 rounded-full border",
                                    isOverTarget
                                      ? "bg-rose-50 text-rose-600 border-rose-200/80"
                                      : isNearingTarget
                                        ? "bg-amber-50 text-amber-700 border-amber-200/80"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                  )}
                                >
                                  {isOverTarget
                                    ? `${usagePercent.toFixed(0)}% over`
                                    : `${usagePercent.toFixed(0)}%`}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
                                expense.target <= 0
                                  ? "bg-gradient-to-r from-violet-400 to-violet-500"
                                  : isOverTarget
                                    ? "bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.35)]"
                                    : isNearingTarget
                                      ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                      : "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                            <span>
                              {expense.target > 0
                                ? `Target: ${formatCurrency(expense.target)}`
                                : "No target set"}
                            </span>
                            <span>
                              {expense.target > 0
                                ? isOverTarget
                                  ? `${formatCurrency(expense.amount - expense.target)} over`
                                  : `${formatCurrency(expense.target - expense.amount)} left`
                                : `${formatCurrency(expense.amount)} total`}
                            </span>
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

type StatCardProps = {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  subText?: React.ReactNode;
  value: string;
};

function StatCard({
  title,
  icon: Icon,
  iconBg,
  subText,
  value,
}: StatCardProps) {
  return (
    <m.div
      className="min-w-0"
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Card className="min-w-0 border-violet-100/90 bg-white/95 shadow-[0_12px_32px_-20px_rgba(109,40,217,0.18)] backdrop-blur-md transition duration-300 hover:border-violet-200 hover:shadow-[0_16px_40px_-18px_rgba(109,40,217,0.28)]">
        <CardContent className="flex flex-col justify-between p-2.5 min-[380px]:p-3 sm:p-3.5 min-h-[96px] sm:min-h-[104px] gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={cn(
                "flex h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 items-center justify-center rounded-lg border shadow-xs",
                iconBg
              )}
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
            <span className="truncate text-xs font-semibold text-slate-700">{title}</span>
          </div>
          <p className="truncate text-base min-[380px]:text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            {value}
          </p>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-500">
            {subText}
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}

function sumTransactionsByType(
  transactions: DashboardTransaction[],
  type: DashboardTransaction["type"],
) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export default DashboardOverview;
