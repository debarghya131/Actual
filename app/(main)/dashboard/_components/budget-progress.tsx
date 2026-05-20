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
          className="min-w-0 gap-2 border-violet-100/80 bg-white/95 py-3 shadow-[0_18px_44px_-32px_rgba(109,40,217,0.26)] transition duration-300 hover:shadow-[0_24px_56px_-28px_rgba(109,40,217,0.36)]"
        >
          <CardHeader className="flex flex-col gap-3 space-y-0 p-3 pb-1 min-[520px]:flex-row min-[520px]:items-start min-[520px]:justify-between">
            <div className="min-w-0 flex-1">
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
              className="inline-flex min-h-10 items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-violet-700 transition duration-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-[0_10px_28px_-14px_rgba(109,40,217,0.5)] min-[520px]:min-h-0"
            >
              {manageLabel}
            </Link>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            {initialBudget && (
              <div className="space-y-0.5">
                <m.div
                  className="relative overflow-hidden rounded-full"
                  initial={{ opacity: 0, scaleX: 0.75 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left center" }}
                >
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
                  <m.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                    animate={{ x: ["-120%", "560%"] }}
                    transition={{
                      duration: 2.3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </m.div>
                <p className="text-right text-xs text-muted-foreground">
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
