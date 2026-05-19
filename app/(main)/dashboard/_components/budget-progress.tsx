"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";

type BudgetProgressProps = {
  initialBudget: {
    id: string;
    amount: number;
  } | null;
  currentExpenses: number;
};

export function BudgetProgress({
  initialBudget,
  currentExpenses,
}: BudgetProgressProps) {
  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  return (
    <Card size="sm" className="gap-2 py-3">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-1">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (All Accounts)
          </CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <CardDescription>
              {initialBudget
                ? `${formatCurrency(currentExpenses)} of ${formatCurrency(initialBudget.amount)} spent`
                : "No budget set"}
            </CardDescription>
          </div>
        </div>
        <Link
          href="/dashboard/budgets"
          className="text-xs font-medium text-violet-700 transition hover:text-violet-900"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {initialBudget && (
          <div className="space-y-0.5">
            <Progress
              className="h-1.5"
              value={percentUsed}
              extraStyles={`${
                // add to Progress component
                percentUsed >= 90
                  ? "bg-red-500"
                  : percentUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
            />
            <p className="text-xs text-muted-foreground text-right">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetProgress;
