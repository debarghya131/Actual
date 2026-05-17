"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function DashboardOverview({
  accounts,
  transactions,
}: DashboardOverviewProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? "",
  );

  const accountTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccountId,
  );

  const recentTransactions = [...accountTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    return (
      transaction.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce<Record<string, number>>(
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
        <CardContent>
          <div className="space-y-4">
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
                  <div className="min-w-0 space-y-1">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseBreakdown.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No expenses this month
            </p>
          ) : (
            <div className="space-y-4">
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
  );
}

export default DashboardOverview;
