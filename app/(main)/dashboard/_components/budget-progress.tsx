"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";

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
  manageHref?: string;
  manageLabel?: string;
};

export function BudgetProgress({
  initialBudget,
  currentExpenses,
  manageHref = "/dashboard/budgets",
  manageLabel = "Manage",
}: BudgetProgressProps) {
  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card
          size="sm"
          className="gap-2 border-violet-100/80 bg-white/95 py-3 shadow-[0_18px_44px_-32px_rgba(109,40,217,0.26)] transition duration-300 hover:shadow-[0_24px_56px_-28px_rgba(109,40,217,0.36)]"
        >
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
              href={manageHref}
              className="rounded-full px-3 py-1 text-xs font-medium text-violet-700 transition duration-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-[0_10px_28px_-14px_rgba(109,40,217,0.5)]"
            >
              {manageLabel}
            </Link>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            {initialBudget && (
              <div className="space-y-0.5">
                <Progress
                  className="h-1.5"
                  value={percentUsed}
                  extraStyles={`${
                    percentUsed >= 90
                      ? "bg-red-500 shadow-[0_0_22px_rgba(239,68,68,0.35)]"
                      : percentUsed >= 75
                        ? "bg-yellow-500 shadow-[0_0_18px_rgba(234,179,8,0.28)]"
                        : "bg-green-500 shadow-[0_0_18px_rgba(34,197,94,0.28)]"
                  }`}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {percentUsed > 100
                    ? `${percentUsed.toFixed(1)}% overused`
                    : `${percentUsed.toFixed(1)}% used`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}

export default BudgetProgress;
