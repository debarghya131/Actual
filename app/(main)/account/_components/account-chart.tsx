"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { LazyMotion, domAnimation, m } from "framer-motion";
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
}: {
  accounts?: AccountChartAccount[];
  transactions: AccountChartTransaction[];
}) {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [accountId, setAccountId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("3M");

  const filteredTransactions = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    return transactions.filter(
      (transaction) =>
        (accountId === "all" || transaction.accountId === accountId) &&
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= endOfDay(now)
    );
  }, [transactions, accountId, dateRange]);

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
        className="min-w-0 space-y-5 md:space-y-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="min-w-0 rounded-2xl border-zinc-200 bg-white/95 shadow-[0_20px_50px_-34px_rgba(109,40,217,0.22)] transition duration-300 hover:shadow-[0_28px_64px_-30px_rgba(109,40,217,0.32)] sm:rounded-[26px]">
        <CardHeader className="flex flex-col gap-4 space-y-0 p-4 pb-5 min-[420px]:p-5 min-[420px]:pb-6 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-normal leading-snug">
            Transaction Overview
          </CardTitle>
          <div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[520px]:grid-cols-2 md:w-auto md:grid-cols-[minmax(10rem,1fr)_minmax(9rem,0.85fr)]">
            {accounts.length > 1 ? (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="min-h-12 w-full rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)]">
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
              <SelectTrigger className="min-h-12 w-full rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 px-4 pb-4 min-[420px]:px-5 min-[420px]:pb-5">
          <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 text-sm min-[560px]:grid-cols-3 md:mb-6">
            <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-left min-[560px]:text-center">
              <p className="text-muted-foreground">Total Income</p>
              <p className="mt-1 break-words text-[clamp(1rem,5vw,1.125rem)] font-bold leading-snug text-green-500">
                {formatCurrency(totals.income)}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-left min-[560px]:text-center">
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="mt-1 break-words text-[clamp(1rem,5vw,1.125rem)] font-bold leading-snug text-red-500">
                {formatCurrency(totals.expense)}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-left min-[560px]:text-center">
              <p className="text-muted-foreground">Net</p>
              <p
                className={`mt-1 break-words text-[clamp(1rem,5vw,1.125rem)] font-bold leading-snug ${
                  totals.income - totals.expense >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(totals.income - totals.expense)}
              </p>
            </div>
          </div>

          <div className="-mx-1 min-w-0 overflow-x-auto overflow-y-hidden px-1 pb-2 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
            <div className="h-[clamp(16rem,58vw,21rem)] min-w-[42rem] md:min-w-0">
              {hasMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={18}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      content={<OverviewBarTooltip />}
                      cursor={false}
                      wrapperStyle={{ zIndex: 20 }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                    <Legend />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-xl border border-zinc-100 bg-zinc-50/70" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </m.div>

      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="min-w-0 rounded-2xl border-zinc-200 bg-white/95 shadow-[0_20px_50px_-34px_rgba(109,40,217,0.22)] transition duration-300 hover:shadow-[0_28px_64px_-30px_rgba(109,40,217,0.32)] sm:rounded-[26px]">
        <CardHeader className="p-4 pb-4 min-[420px]:p-5 min-[420px]:pb-5">
          <CardTitle className="text-base font-normal leading-snug">
            Income & Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-4 pb-4 min-[420px]:px-5 min-[420px]:pb-5">
          <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
            <CategoryBreakdownColumn
              title="Income Categories"
              emptyMessage="No income categories for this range"
              items={categoryBreakdown.income}
              valueClassName="text-green-600"
              hasMounted={hasMounted}
            />
            <CategoryBreakdownColumn
              title="Expense Categories"
              emptyMessage="No expense categories for this range"
              items={categoryBreakdown.expense}
              valueClassName="text-red-600"
              hasMounted={hasMounted}
            />
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
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-[0_16px_36px_-30px_rgba(109,40,217,0.18)] transition duration-300 hover:shadow-[0_22px_44px_-28px_rgba(109,40,217,0.26)] min-[420px]:p-4 sm:rounded-[22px]">
      <div className="mb-4 flex min-w-0 flex-col gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-3">
        <p className="min-w-0 break-words text-sm font-medium text-slate-950">{title}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? "category" : "categories"}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="min-w-0 space-y-5">
          <div className="h-[clamp(12rem,52vw,14rem)] min-w-0">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius="48%"
                    outerRadius="70%"
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
              <div className="h-full rounded-xl border border-zinc-100 bg-zinc-50/70" />
            )}
          </div>

          <div className="grid min-w-0 gap-3 min-[520px]:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="break-words text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {totalLabel}
              </p>
              <p className={`mt-1 break-words text-[clamp(1rem,5vw,1.125rem)] font-semibold leading-snug ${valueClassName}`}>
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="break-words text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Categories Used
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {items.length}
              </p>
            </div>
          </div>

          <div className="max-h-[min(22rem,60vh)] min-w-0 space-y-4 overflow-y-auto pr-1 min-[420px]:pr-2">
            {items.map((item) => (
              <m.div
                key={item.id}
                className="min-w-0 space-y-2 rounded-2xl px-1.5 py-1.5 transition duration-300 hover:bg-violet-50/40 min-[420px]:px-2"
                whileHover={{ y: -2, scale: 1.005 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <div className="flex min-w-0 flex-col gap-1 text-sm min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="min-w-0 break-words font-medium text-slate-900">
                      {item.category}
                    </span>
                  </div>
                  <span className={`break-words font-medium min-[420px]:shrink-0 ${valueClassName}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <m.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.share, 100)}%` }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 18px ${item.color}55`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {item.share.toFixed(1)}% of selected {title.toLowerCase()}
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
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <p className="text-sm font-medium text-slate-950">{item.category}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-950">
        {formatCurrency(item.amount)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {item.share.toFixed(1)}% of selected total
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
    <div className="min-w-[140px] rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-slate-950">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => {
          const value = Number(entry.value ?? 0);
          if (value <= 0) {
            return null;
          }

          return (
            <div
              key={entry.dataKey ?? entry.name}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-700">{entry.name}</span>
              </div>
              <span className="font-semibold text-slate-950">
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
