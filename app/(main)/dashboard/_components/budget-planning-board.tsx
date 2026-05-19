"use client";

import { useState } from "react";
import { Check, Pencil, PiggyBank, Target, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { updateBudget } from "@/app/actions/budget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/currency";

type CategoryBudgetItem = {
  category: string;
  color: string;
  spent: number;
  suggested: number;
};

type BudgetPlanningBoardProps = {
  initialBudget: {
    id: string;
    amount: number;
  } | null;
  currentExpenses: number;
  currentIncome: number;
  savingsGoalSeed: number;
  categoryItems: CategoryBudgetItem[];
};

const CATEGORY_STORAGE_KEY = "budget-category-targets";
const GOAL_STORAGE_KEY = "budget-savings-goal";
const UPCOMING_BUDGETS_STORAGE_KEY = "budget-upcoming-month-targets";
const UPCOMING_GOALS_STORAGE_KEY = "budget-upcoming-goal-targets";

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getMonthKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function getBudgetTimeline(baseDate: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = addMonths(baseDate, index);
    return {
      key: getMonthKey(date),
      label: date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  });
}

function getDefaultUpcomingGoalTargets(seedAmount: number) {
  const defaultGoalAmount = seedAmount.toFixed(0);

  return Object.fromEntries(
    getBudgetTimeline(new Date(), 6).map((month) => [month.key, defaultGoalAmount])
  );
}

function getDefaultUpcomingBudgetTargets(
  initialAmount: number | null,
  fallbackAmount: number
) {
  const defaultAmount = (initialAmount ?? fallbackAmount).toFixed(0);

  return Object.fromEntries(
    getBudgetTimeline(new Date(), 6).map((month) => [month.key, defaultAmount])
  );
}

export default function BudgetPlanningBoard({
  initialBudget,
  currentExpenses,
  currentIncome,
  savingsGoalSeed,
  categoryItems,
}: BudgetPlanningBoardProps) {
  const defaultCategoryTargets = Object.fromEntries(
    categoryItems.map((item) => [item.category, item.suggested.toFixed(0)])
  );
  const today = new Date();
  const budgetTimeline = getBudgetTimeline(today, 6);
  const currentMonthKey = budgetTimeline[0]?.key;

  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [monthlyBudgetValue, setMonthlyBudgetValue] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [goalValue, setGoalValue] = useState(() => {
    if (typeof window === "undefined") {
      return savingsGoalSeed.toFixed(0);
    }

    return window.localStorage.getItem(GOAL_STORAGE_KEY) ?? savingsGoalSeed.toFixed(0);
  });
  const [upcomingGoalTargets, setUpcomingGoalTargets] = useState<Record<string, string>>(
    () => {
      const defaultUpcomingGoals = getDefaultUpcomingGoalTargets(savingsGoalSeed);

      if (typeof window === "undefined") {
        return defaultUpcomingGoals;
      }

      const storedGoals = window.localStorage.getItem(UPCOMING_GOALS_STORAGE_KEY);
      const parsedGoals = storedGoals
        ? (JSON.parse(storedGoals) as Record<string, string>)
        : {};

      return {
        ...defaultUpcomingGoals,
        ...parsedGoals,
      };
    }
  );
  const [categoryTargets, setCategoryTargets] = useState<Record<string, string>>(
    () => {
      if (typeof window === "undefined") {
        return defaultCategoryTargets;
      }

      const storedTargets = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
      return storedTargets
        ? (JSON.parse(storedTargets) as Record<string, string>)
        : defaultCategoryTargets;
    }
  );
  const [upcomingBudgetTargets, setUpcomingBudgetTargets] = useState<Record<string, string>>(
    () => {
      const defaultUpcomingTargets = getDefaultUpcomingBudgetTargets(
        initialBudget?.amount ?? null,
        savingsGoalSeed
      );

      if (typeof window === "undefined") {
        return defaultUpcomingTargets;
      }

      const storedTargets = window.localStorage.getItem(UPCOMING_BUDGETS_STORAGE_KEY);
      const parsedTargets = storedTargets
        ? (JSON.parse(storedTargets) as Record<string, string>)
        : {};

      return {
        ...defaultUpcomingTargets,
        ...parsedTargets,
      };
    }
  );

  const {
    loading: isUpdatingMonthly,
    fn: updateBudgetFn,
  } = useFetch(updateBudget);

  const effectiveBudgetAmount = Number(monthlyBudgetValue || initialBudget?.amount || 0);
  const currentSavings = Math.max(currentIncome - currentExpenses, 0);
  const savingsGoal = Number(
    (currentMonthKey && upcomingGoalTargets[currentMonthKey]) || goalValue || 0
  );
  const goalProgress =
    savingsGoal > 0 ? Math.min((currentSavings / savingsGoal) * 100, 100) : 0;
  const monthlyBudgetProgress =
    effectiveBudgetAmount > 0
      ? Math.min((currentExpenses / effectiveBudgetAmount) * 100, 100)
      : 0;

  const handleMonthlySave = async () => {
    const currentBudgetTarget =
      (currentMonthKey && upcomingBudgetTargets[currentMonthKey]) || monthlyBudgetValue;
    const amount = Number(currentBudgetTarget);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid monthly budget");
      return;
    }

    try {
      await updateBudgetFn(amount);
      const normalizedAmount = amount.toFixed(0);
      const nextTargets = { ...upcomingBudgetTargets };

      if (currentMonthKey) {
        nextTargets[currentMonthKey] = normalizedAmount;
      }

      budgetTimeline.forEach((month) => {
        if (!nextTargets[month.key]) {
          nextTargets[month.key] = normalizedAmount;
        }
      });

      window.localStorage.setItem(
        UPCOMING_BUDGETS_STORAGE_KEY,
        JSON.stringify(nextTargets)
      );
      setMonthlyBudgetValue(normalizedAmount);
      setUpcomingBudgetTargets(nextTargets);
      setIsEditingMonthly(false);
      toast.success("Monthly budget updated");
    } catch {
      toast.error("Failed to update monthly budget");
    }
  };

  const handleGoalSave = () => {
    const currentGoalTarget =
      (currentMonthKey && upcomingGoalTargets[currentMonthKey]) || goalValue;
    const amount = Number(currentGoalTarget);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid savings goal");
      return;
    }

    const normalizedAmount = amount.toFixed(0);
    const nextGoals = { ...upcomingGoalTargets };

    if (currentMonthKey) {
      nextGoals[currentMonthKey] = normalizedAmount;
    }

    budgetTimeline.forEach((month) => {
      if (!nextGoals[month.key]) {
        nextGoals[month.key] = normalizedAmount;
      }
    });

    window.localStorage.setItem(GOAL_STORAGE_KEY, normalizedAmount);
    window.localStorage.setItem(
      UPCOMING_GOALS_STORAGE_KEY,
      JSON.stringify(nextGoals)
    );
    setGoalValue(normalizedAmount);
    setUpcomingGoalTargets(nextGoals);
    setIsEditingGoal(false);
    toast.success("Savings goal saved");
  };

  const handleCategoryTargetChange = (category: string, value: string) => {
    setCategoryTargets((current) => ({
      ...current,
      [category]: value,
    }));
  };

  const handleCategorySave = () => {
    window.localStorage.setItem(
      CATEGORY_STORAGE_KEY,
      JSON.stringify(categoryTargets)
    );
    toast.success("Category budget plan saved");
  };

  const handleUpcomingBudgetChange = (monthKey: string, value: string) => {
    setUpcomingBudgetTargets((current) => ({
      ...current,
      [monthKey]: value,
    }));
  };

  const handleUpcomingGoalChange = (monthKey: string, value: string) => {
    setUpcomingGoalTargets((current) => ({
      ...current,
      [monthKey]: value,
    }));
  };

  const restoreBudgetTargets = () => {
    const defaultUpcomingTargets = getDefaultUpcomingBudgetTargets(
      initialBudget?.amount ?? null,
      savingsGoalSeed
    );

    if (typeof window === "undefined") {
      const fallbackAmount = (initialBudget?.amount ?? savingsGoalSeed).toFixed(0);
      setUpcomingBudgetTargets(defaultUpcomingTargets);
      setMonthlyBudgetValue(fallbackAmount);
      return;
    }

    const storedTargets = window.localStorage.getItem(UPCOMING_BUDGETS_STORAGE_KEY);
    const parsedTargets = storedTargets
      ? (JSON.parse(storedTargets) as Record<string, string>)
      : {};
    const restoredTargets = {
      ...defaultUpcomingTargets,
      ...parsedTargets,
    };
    const currentBudgetTarget =
      (currentMonthKey && restoredTargets[currentMonthKey]) ||
      initialBudget?.amount?.toFixed(0) ||
      savingsGoalSeed.toFixed(0);

    setUpcomingBudgetTargets(restoredTargets);
    setMonthlyBudgetValue(currentBudgetTarget);
  };

  const restoreGoalTargets = () => {
    const defaultUpcomingGoals = getDefaultUpcomingGoalTargets(savingsGoalSeed);

    if (typeof window === "undefined") {
      setUpcomingGoalTargets(defaultUpcomingGoals);
      setGoalValue(savingsGoalSeed.toFixed(0));
      return;
    }

    const storedGoalValue =
      window.localStorage.getItem(GOAL_STORAGE_KEY) ?? savingsGoalSeed.toFixed(0);
    const storedGoals = window.localStorage.getItem(UPCOMING_GOALS_STORAGE_KEY);
    const parsedGoals = storedGoals
      ? (JSON.parse(storedGoals) as Record<string, string>)
      : {};
    const restoredGoals = {
      ...defaultUpcomingGoals,
      ...parsedGoals,
    };

    setGoalValue(storedGoalValue);
    setUpcomingGoalTargets(restoredGoals);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <Card className="border-violet-100 bg-white/95 xl:col-span-12">
        <CardHeader className="flex flex-row items-start justify-between p-5 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Wallet className="h-4 w-4 text-violet-700" />
              Monthly Budget Set (All Accounts)
            </CardTitle>
            <p className="mt-2 text-sm text-violet-950/60">
              Set one total monthly spending limit and compare it with live expenses across all accounts.
            </p>
          </div>

          {!isEditingMonthly ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingMonthly(true)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5 px-5 pb-5">
          {isEditingMonthly ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMonthlySave}
                  disabled={isUpdatingMonthly}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    restoreBudgetTargets();
                    setIsEditingMonthly(false);
                  }}
                  disabled={isUpdatingMonthly}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
                <div className="mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Upcoming 5 Month Plan
                    </p>
                    <p className="mt-1 text-xs text-violet-950/60">
                      Set the current month first, then the next five months.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {budgetTimeline.map((month, index) => (
                    <div
                      key={month.key}
                      className="rounded-2xl border border-violet-100 bg-white p-4"
                    >
                      <p className="text-sm font-medium text-slate-950">
                        {index === 0 ? `${month.label} (Current)` : month.label}
                      </p>
                      <Input
                        type="number"
                        value={upcomingBudgetTargets[month.key] || ""}
                        onChange={(e) =>
                          handleUpcomingBudgetChange(month.key, e.target.value)
                        }
                        placeholder="Set month budget"
                        className="mt-3"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile
                  label="Budget"
                  value={formatCurrency(effectiveBudgetAmount)}
                />
                <StatTile
                  label="Spent"
                  value={formatCurrency(currentExpenses)}
                />
                <StatTile
                  label="Remaining"
                  value={formatCurrency(
                    Math.max(effectiveBudgetAmount - currentExpenses, 0)
                  )}
                />
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-950">
                    Upcoming 5 Month Plan
                  </p>
                  <p className="mt-1 text-xs text-violet-950/60">
                    This rolling planner keeps the current month plus the next five months ready.
                  </p>
                </div>

                <div className="space-y-4">
                  {budgetTimeline.map((month, index) => {
                    const plannedBudget = Number(upcomingBudgetTargets[month.key] || 0);
                    const progressValue =
                      month.key === currentMonthKey ? monthlyBudgetProgress : 0;
                    const progressStyles =
                      month.key === currentMonthKey
                        ? monthlyBudgetProgress >= 100
                          ? "bg-red-500"
                          : monthlyBudgetProgress >= 80
                            ? "bg-amber-500"
                            : "bg-green-500"
                        : "bg-violet-200";

                    return (
                      <div key={month.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-950">
                            {index === 0 ? `${month.label} (Current)` : month.label}
                          </span>
                          <span className="text-violet-950/65">
                            {formatCurrency(plannedBudget)}
                          </span>
                        </div>
                        <Progress
                          value={month.key === currentMonthKey ? progressValue : 100}
                          className="h-1.5"
                          extraStyles={progressStyles}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <Card className="border-violet-100 bg-white/95 xl:col-span-6">
        <CardHeader className="flex flex-row items-start justify-between p-5 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <PiggyBank className="h-4 w-4 text-violet-700" />
              Category-wise Budget Set
            </CardTitle>
            <p className="mt-2 text-sm text-violet-950/60">
              Plan category caps based on actual monthly spending patterns.
            </p>
          </div>

          <Button onClick={handleCategorySave} className="bg-slate-950 text-white hover:bg-slate-900">
            Save Plan
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-2">
          {categoryItems.map((item) => {
            const target = Number(categoryTargets[item.category] || 0);
            const spentPercent = target > 0 ? Math.min((item.spent / target) * 100, 100) : 0;

            return (
              <div
                key={item.category}
                className="rounded-2xl border border-violet-100 bg-violet-50/55 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">{item.category}</p>
                    <p className="mt-1 text-xs text-violet-950/60">
                      Spent {formatCurrency(item.spent)} this month
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-[11px] font-medium text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    Live
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <Input
                    type="number"
                    value={categoryTargets[item.category] || ""}
                    onChange={(e) =>
                      handleCategoryTargetChange(item.category, e.target.value)
                    }
                    placeholder="Set category budget"
                  />
                  <Progress value={spentPercent} className="h-1.5" />
                  <div className="flex items-center justify-between text-[11px] text-violet-950/60">
                    <span>Target {formatCurrency(target)}</span>
                    <span>{spentPercent.toFixed(0)}% used</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="h-full border-violet-100 bg-white/95 xl:col-span-6">
        <CardHeader className="flex flex-row items-start justify-between p-5 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Target className="h-4 w-4 text-violet-700" />
              Goal Saving
            </CardTitle>
            <p className="mt-2 text-sm text-violet-950/60">
              Set the current month first, then keep the next five savings goals ready.
            </p>
          </div>

          {!isEditingGoal ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingGoal(true)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="flex h-full flex-col space-y-4 px-5 pb-5">
          {isEditingGoal ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoalSave}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    restoreGoalTargets();
                    setIsEditingGoal(false);
                  }}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
                <div className="mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Savings Goal Timeline
                    </p>
                    <p className="mt-1 text-xs text-violet-950/60">
                      Keep the current month plus the next five months planned.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {budgetTimeline.map((month, index) => (
                    <div key={month.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-950">
                          {index === 0 ? `${month.label} (Current)` : month.label}
                        </span>
                        <span className="text-violet-950/65">
                          {formatCurrency(Number(upcomingGoalTargets[month.key] || 0))}
                        </span>
                      </div>
                      <Input
                        type="number"
                        value={upcomingGoalTargets[month.key] || ""}
                        onChange={(e) =>
                          handleUpcomingGoalChange(month.key, e.target.value)
                        }
                        placeholder="Set savings goal"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <StatTile
                  label="Current savings"
                  value={formatCurrency(currentSavings)}
                />
                <StatTile label="Goal target" value={formatCurrency(savingsGoal)} />
              </div>

              <div className="flex-1 rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-950">
                    Savings Goal Timeline
                  </p>
                  <p className="mt-1 text-xs text-violet-950/60">
                    This rolling planner keeps the current month plus the next five months ready.
                  </p>
                </div>

                <div className="space-y-4">
                  {budgetTimeline.map((month, index) => {
                    const plannedGoal = Number(upcomingGoalTargets[month.key] || 0);
                    const progressValue =
                      month.key === currentMonthKey ? goalProgress : 100;
                    const progressStyles =
                      month.key === currentMonthKey ? "bg-violet-600" : "bg-violet-200";

                    return (
                      <div key={month.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-950">
                            {index === 0 ? `${month.label} (Current)` : month.label}
                          </span>
                          <span className="text-violet-950/65">
                            {formatCurrency(plannedGoal)}
                          </span>
                        </div>
                        <Progress
                          value={progressValue}
                          className="h-1.5"
                          extraStyles={progressStyles}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/55 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-700">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
