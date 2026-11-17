"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { AlertCircle, CheckCircle2, TrendingUp, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

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
  const isOverBudget = percentUsed > 100;
  const isWarning = percentUsed >= 80 && percentUsed <= 100;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="shrink-0 min-w-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card
          size="sm"
          className="min-w-0 border-violet-100/90 bg-white/95 px-3.5 py-3 shadow-[0_12px_32px_-20px_rgba(109,40,217,0.18)] backdrop-blur-md transition duration-300 hover:border-violet-200 hover:shadow-[0_16px_38px_-18px_rgba(109,40,217,0.26)] sm:px-4.5 sm:py-3.5"
        >
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {/* Header row */}
            <div className="flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100/80 text-violet-700 shadow-xs">
                  <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    Monthly Budget (All Accounts)
                  </h3>
                  <p className="truncate text-[11px] sm:text-xs text-slate-500 font-medium">
                    {initialBudget
                      ? `${formatCurrency(currentExpenses)} of ${formatCurrency(initialBudget.amount)} spent`
                      : "No budget set for this period"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between min-[480px]:justify-end gap-2 shrink-0">
                {initialBudget ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                      isOverBudget
                        ? "bg-rose-50 text-rose-600 border-rose-200/80"
                        : isWarning
                          ? "bg-amber-50 text-amber-700 border-amber-200/80"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                    )}
                  >
                    {isOverBudget ? (
                      <AlertCircle className="h-3 w-3 shrink-0" />
                    ) : isWarning ? (
                      <TrendingUp className="h-3 w-3 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                    )}
                    {percentUsed.toFixed(1)}% {isOverBudget ? "overused" : "used"}
                  </span>
                ) : null}

                <Link
                  href={manageHref}
                  className="inline-flex items-center justify-center rounded-full border border-violet-200/80 bg-violet-50/70 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-violet-700 shadow-xs transition duration-200 hover:border-violet-300 hover:bg-violet-100/80 hover:text-violet-900 shrink-0"
                >
                  {manageLabel}
                </Link>
              </div>
            </div>

            {/* Progress bar */}
            {initialBudget && (
              <div className="space-y-1">
                <m.div
                  className="relative overflow-hidden rounded-full"
                  initial={{ opacity: 0, scaleX: 0.8 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left center" }}
                >
                  <Progress
                    className="h-1.5 sm:h-2 bg-slate-100"
                    value={Math.min(percentUsed, 100)}
                    extraStyles={cn(
                      "rounded-full transition-all duration-700",
                      isOverBudget
                        ? "bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 shadow-[0_0_14px_rgba(239,68,68,0.4)]"
                        : isWarning
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.35)]"
                          : "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_14px_rgba(16,185,129,0.35)]"
                    )}
                  />
                  <m.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                    animate={{ x: ["-120%", "560%"] }}
                    transition={{
                      duration: 2.3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </m.div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 gap-1">
                  <span className="truncate">
                    {isOverBudget
                      ? `Exceeded by ${formatCurrency(currentExpenses - initialBudget.amount)}`
                      : `${formatCurrency(initialBudget.amount - currentExpenses)} remaining`}
                  </span>
                  <span className="truncate shrink-0">Target: {formatCurrency(initialBudget.amount)}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </m.div>
    </LazyMotion>
  );
}

export default BudgetProgress;
