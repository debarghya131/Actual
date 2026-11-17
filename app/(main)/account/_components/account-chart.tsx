"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { BarChart3, List } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultCategories } from "@/data/categories";
import { formatCurrency } from "@/lib/currency";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
} as const;

type DateRange = keyof typeof DATE_RANGES;

type AccountChartTransaction = {
  accountId?: string;
  date: Date | string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category?: string | null;
};

type AccountChartAccount = {
  id: string;
  name: string;
};

type ChartDataPoint = {
  date: string;
  timestamp: number;
  income: number;
  expense: number;
};

type CategoryBreakdownItem = {
  id: string;
  category: string;
  amount: number;
  share: number;
  color: string;
};

const categoryLookup = defaultCategories.reduce<
  Record<
    string,
    {
      id: string;
      name: string;
      type: "INCOME" | "EXPENSE";
      color: string;
    }
  >
>((acc, category) => {
  acc[category.id] = {
    id: category.id,
    name: category.name,
    type: category.type as "INCOME" | "EXPENSE",
    color: category.color,
  };
  return acc;
}, {});

function getFallbackCategoryLabel(category?: string | null) {
  const value = (category ?? "").trim().replace(/-/g, " ");
  if (!value) {
    return "Uncategorized";
  }

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getCategoryKey(category?: string | null) {
  const value = (category ?? "").trim().toLowerCase();
  return value || "uncategorized";
}

export function AccountChart({
  accounts = [],
  transactions,
  referenceDate,
}: {
  accounts?: AccountChartAccount[];
  transactions: AccountChartTransaction[];
  referenceDate?: string;
}) {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [accountId, setAccountId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("3M");
  const [mobileAnalyticsSection, setMobileAnalyticsSection] = useState<
    "overview" | "categories"
  >("overview");

  const filteredTransactions = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    return transactions.filter(
      (transaction) =>
        (accountId === "all" || transaction.accountId === accountId) &&
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= endOfDay(now)
    );
  }, [transactions, accountId, dateRange, referenceDate]);

  const filteredData = useMemo(() => {
    const grouped = filteredTransactions.reduce<Record<string, ChartDataPoint>>(
      (acc, transaction) => {
        const transactionDate = startOfDay(new Date(transaction.date));
        const date = format(transactionDate, "MMM dd");

        if (!acc[date]) {
          acc[date] = {
            date,
            timestamp: transactionDate.getTime(),
            income: 0,
            expense: 0,
          };
        }

        if (transaction.type === "INCOME") {
          acc[date].income += transaction.amount;
        } else {
          acc[date].expense += transaction.amount;
        }

        return acc;
      },
      {}
    );

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => ({
        income:
          transaction.type === "INCOME"
            ? acc.income + transaction.amount
            : acc.income,
        expense:
          transaction.type === "EXPENSE"
            ? acc.expense + transaction.amount
            : acc.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const categoryBreakdown = useMemo(() => {
    const totalsByType = {
      INCOME: {} as Record<string, number>,
      EXPENSE: {} as Record<string, number>,
    };

    filteredTransactions.forEach((transaction) => {
      const category = getCategoryKey(transaction.category);
      totalsByType[transaction.type][category] =
        (totalsByType[transaction.type][category] ?? 0) + transaction.amount;
    });

    const mapCategoryEntries = (
      type: "INCOME" | "EXPENSE",
      entries: Record<string, number>,
      totalAmount: number
    ): CategoryBreakdownItem[] =>
      Object.entries(entries)
        .map(([categoryId, amount]) => {
          const categoryMeta = categoryLookup[categoryId];
          return {
            id: categoryId,
            category:
              categoryMeta && categoryMeta.type === type
                ? categoryMeta.name
                : getFallbackCategoryLabel(categoryId),
            amount,
            share: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
            color:
              categoryMeta && categoryMeta.type === type
                ? categoryMeta.color
                : type === "INCOME"
                  ? "#22c55e"
                  : "#ef4444",
          };
        })
        .sort((a, b) => b.amount - a.amount);

    return {
      income: mapCategoryEntries("INCOME", totalsByType.INCOME, totals.income),
      expense: mapCategoryEntries("EXPENSE", totalsByType.EXPENSE, totals.expense),
    };
  }, [filteredTransactions, totals.expense, totals.income]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="flex flex-1 min-h-0 min-w-0 flex-col gap-4 xl:grid xl:grid-cols-2 xl:gap-5 xl:h-full"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile tab switcher */}
        <div className="col-span-full grid grid-cols-2 gap-1 rounded-2xl border border-violet-100 bg-white/90 p-1 shadow-sm xl:hidden shrink-0">
          {([
            ["overview", "Overview", BarChart3],
            ["categories", "Categories", List],
          ] as const).map(([section, label, Icon]) => (
            <button
              key={section}
              type="button"
              aria-pressed={mobileAnalyticsSection === section}
              onClick={() => setMobileAnalyticsSection(section)}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium transition ${
                mobileAnalyticsSection === section
                  ? "bg-violet-700 text-white shadow-sm"
                  : "text-violet-800 hover:bg-violet-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* Card 1 — Transaction Overview (bar chart) */}
        <m.div
          className={`min-w-0 xl:h-full xl:min-h-0 flex flex-col ${mobileAnalyticsSection === "overview" ? "flex" : "hidden xl:flex"}`}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
            <CardHeader className="flex flex-col gap-3 border-b border-violet-50/90 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5 shrink-0 space-y-0">
              <div className="min-w-0">
                <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                  Transaction Overview
                </CardTitle>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                  Income vs expenses across the selected period.
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:justify-end shrink-0">
                {accounts.length > 1 ? (
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="h-8 w-full text-xs sm:w-[9rem] bg-violet-50/50 border-violet-200 rounded-xl">
                      <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Select
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as DateRange)}
                >
                  <SelectTrigger className="h-8 w-full text-xs sm:w-[8.5rem] bg-violet-50/50 border-violet-200 rounded-xl">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 min-h-0 flex-col p-3 sm:p-4 gap-3 overflow-hidden">
              {/* Summary stat tiles */}
              <div className="grid grid-cols-3 gap-2 shrink-0">
                <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/55 px-1.5 py-2 text-center min-[420px]:px-2.5">
                  <p className="truncate text-[9px] font-medium uppercase tracking-wide text-violet-700/80 min-[420px]:text-[10px]">Income</p>
                  <p className="mt-0.5 whitespace-nowrap text-[clamp(0.625rem,3.2vw,0.875rem)] font-bold leading-tight tracking-tight text-emerald-600">
                    {formatCurrency(totals.income)}
                  </p>
                </div>
                <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/55 px-1.5 py-2 text-center min-[420px]:px-2.5">
                  <p className="truncate text-[9px] font-medium uppercase tracking-wide text-violet-700/80 min-[420px]:text-[10px]">Expenses</p>
                  <p className="mt-0.5 whitespace-nowrap text-[clamp(0.625rem,3.2vw,0.875rem)] font-bold leading-tight tracking-tight text-rose-600">
                    {formatCurrency(totals.expense)}
                  </p>
                </div>
                <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/55 px-1.5 py-2 text-center min-[420px]:px-2.5">
                  <p className="truncate text-[9px] font-medium uppercase tracking-wide text-violet-700/80 min-[420px]:text-[10px]">Net</p>
                  <p className={`mt-0.5 whitespace-nowrap text-[clamp(0.625rem,3.2vw,0.875rem)] font-bold leading-tight tracking-tight ${totals.income - totals.expense >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(totals.income - totals.expense)}
                  </p>
                </div>
              </div>

              {/* Bar chart — fills remaining card height using absolute fill pattern */}
              <div className="relative flex-1 min-h-[16rem]">
                <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
                  <div className="h-full min-w-[26rem] sm:min-w-[36rem] xl:min-w-0">
                    {hasMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredData}
                          margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede9fe" />
                          <XAxis
                            dataKey="date"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            minTickGap={18}
                            tick={{ fill: "#7c3aed", opacity: 0.65 }}
                          />
                          <YAxis
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={68}
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={{ fill: "#7c3aed", opacity: 0.65 }}
                          />
                          <Tooltip
                            content={<OverviewBarTooltip />}
                            cursor={{ fill: "rgba(139,92,246,0.06)" }}
                            wrapperStyle={{ zIndex: 20 }}
                            allowEscapeViewBox={{ x: true, y: true }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                            iconType="circle"
                            iconSize={8}
                          />
                          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[5, 5, 0, 0]} maxBarSize={28} />
                          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[5, 5, 0, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full rounded-xl border border-violet-100 bg-violet-50/40 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Card 2 — Income & Expenses by Category */}
        <m.div
          className={`min-w-0 xl:h-full xl:min-h-0 flex flex-col ${mobileAnalyticsSection === "categories" ? "flex" : "hidden xl:flex"}`}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
            <CardHeader className="border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Income &amp; Expenses by Category
              </CardTitle>
              <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                Category breakdown for the selected period.
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 min-h-0 flex-col p-3 sm:p-4 overflow-hidden">
              {/* Always side-by-side from sm+, stacked on mobile */}
              <div className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex flex-col min-h-[16rem] sm:min-h-0">
                  <CategoryBreakdownColumn
                    title="Income Categories"
                    emptyMessage="No income categories for this range"
                    items={categoryBreakdown.income}
                    valueClassName="text-green-600"
                    hasMounted={hasMounted}
                  />
                </div>
                <div className="flex flex-col min-h-[16rem] sm:min-h-0">
                  <CategoryBreakdownColumn
                    title="Expense Categories"
                    emptyMessage="No expense categories for this range"
                    items={categoryBreakdown.expense}
                    valueClassName="text-red-600"
                    hasMounted={hasMounted}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

function CategoryBreakdownColumn({
  title,
  emptyMessage,
  items,
  valueClassName,
  hasMounted,
}: {
  title: string;
  emptyMessage: string;
  items: CategoryBreakdownItem[];
  valueClassName: string;
  hasMounted: boolean;
}) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalLabel = title.toLowerCase().includes("income")
    ? "Total Income"
    : "Total Expenses";

  return (
    <div className="h-full flex flex-col min-w-0 rounded-2xl border border-violet-100/80 bg-violet-50/30 p-2.5 sm:p-3 overflow-hidden">
      <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2 shrink-0">
        <p className="min-w-0 truncate text-xs font-semibold text-slate-900">{title}</p>
        <p className="shrink-0 rounded-full border border-violet-100 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700">
          {items.length} {items.length === 1 ? "category" : "categories"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-violet-200 bg-white/60 px-4 py-6 text-center">
          <p className="text-xs text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col gap-2.5 overflow-hidden">
          {/* Donut chart + totals row */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-[6rem] w-[6rem] shrink-0">
              {hasMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={items}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius="52%"
                      outerRadius="80%"
                      paddingAngle={2}
                      stroke="none"
                      label={false}
                      labelLine={false}
                    >
                      {items.map((item) => (
                        <Cell key={item.id} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CategoryPieTooltip />}
                      cursor={false}
                      wrapperStyle={{ zIndex: 20 }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-full border border-violet-100 bg-violet-50/60 animate-pulse" />
              )}
            </div>
            <div className="flex flex-1 min-w-0 flex-col gap-1.5">
              <div className="min-w-0 rounded-xl border border-violet-100 bg-white px-2.5 py-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-violet-700/70">{totalLabel}</p>
                <p className={`mt-0.5 break-words text-sm font-bold leading-tight ${valueClassName}`}>
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-violet-100 bg-white px-2.5 py-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-violet-700/70">Categories</p>
                <p className="mt-0.5 text-sm font-bold leading-tight text-slate-900">{items.length}</p>
              </div>
            </div>
          </div>

          {/* Category list — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto modern-scrollbar space-y-1.5 pr-0.5">
            {items.map((item) => (
              <m.div
                key={item.id}
                className="min-w-0 space-y-1 rounded-xl px-2 py-1.5 transition duration-200 hover:bg-violet-100/50"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
              >
                <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="min-w-0 truncate font-medium text-slate-900">
                      {item.category}
                    </span>
                  </div>
                  <span className={`shrink-0 font-semibold ${valueClassName}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-violet-100/60">
                  <m.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.share, 100)}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}44`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-violet-700/60 font-medium">
                  {item.share.toFixed(1)}% of {title.toLowerCase()}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: CategoryBreakdownItem;
  }>;
}) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-violet-100 bg-white px-3 py-2 shadow-lg shadow-violet-100/50">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <p className="text-xs font-semibold text-slate-900">{item.category}</p>
      </div>
      <p className="mt-1.5 text-sm font-bold text-slate-900">
        {formatCurrency(item.amount)}
      </p>
      <p className="mt-0.5 text-[11px] text-violet-700/60 font-medium">
        {item.share.toFixed(1)}% of total
      </p>
    </div>
  );
}

function OverviewBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
    color?: string;
    name?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-[140px] rounded-xl border border-violet-100 bg-white px-3 py-2 shadow-lg shadow-violet-100/50">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => {
          const value = Number(entry.value ?? 0);
          if (value <= 0) {
            return null;
          }

          return (
            <div
              key={entry.dataKey ?? entry.name}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-900">
                {formatCurrency(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AccountChart;
