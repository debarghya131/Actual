"use client";

import { useState } from "react";
import { Check, Pencil, PiggyBank, Plus, Target, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import {
  updateBudget,
  updateBudgetDashboardPreferences,
} from "@/app/actions/budget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/currency";
import { showDemoModeToast } from "@/lib/demo-mode";

type CategoryBudgetDefinition = {
  id: string;
  category: string;
  color: string;
};

type CompletedBudgetTransaction = {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  date: string;
};

type CategoryBudgetItem = CategoryBudgetDefinition & {
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
  categoryDefinitions: CategoryBudgetDefinition[];
  completedTransactions: CompletedBudgetTransaction[];
  initialPreferences: {
    monthlyBudgetTargets: Record<string, string>;
    savingsGoalTargets: Record<string, string>;
    categoryTargetsByMonth: Record<string, Record<string, string>>;
    visibleCategoryIdsByMonth: Record<string, string[]>;
  };
  demoMode?: boolean;
};

const BUDGET_TIMELINE_MONTH_COUNT = 8;

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getMonthKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function getMonthLabel(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDisplayMonthLabel(monthKey: string, currentMonthKey?: string) {
  return monthKey === currentMonthKey
    ? `${getMonthLabel(monthKey)} (Current)`
    : getMonthLabel(monthKey);
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
    getBudgetTimeline(new Date(), BUDGET_TIMELINE_MONTH_COUNT).map((month) => [
      month.key,
      defaultGoalAmount,
    ])
  );
}

function getDefaultUpcomingBudgetTargets(
  initialAmount: number | null,
  fallbackAmount: number
) {
  const defaultAmount = (initialAmount ?? fallbackAmount).toFixed(0);

  return Object.fromEntries(
    getBudgetTimeline(new Date(), BUDGET_TIMELINE_MONTH_COUNT).map((month) => [
      month.key,
      defaultAmount,
    ])
  );
}

function pickTimelineMonthValues(
  source: Record<string, string>,
  timelineKeys: string[]
) {
  return timelineKeys.reduce<Record<string, string>>((acc, key) => {
    if (typeof source[key] === "string") {
      acc[key] = source[key];
    }
    return acc;
  }, {});
}

function buildCategoryItemsForMonth(
  monthKey: string,
  categoryDefinitions: CategoryBudgetDefinition[],
  completedTransactions: CompletedBudgetTransaction[]
) {
  return categoryDefinitions
    .map((category) => {
      const spent = completedTransactions
        .filter((transaction) => {
          return (
            transaction.type === "EXPENSE" &&
            transaction.category.toLowerCase() === category.id.toLowerCase() &&
            getMonthKey(new Date(transaction.date)) === monthKey
          );
        })
        .reduce((total, transaction) => total + transaction.amount, 0);

      return {
        id: category.id,
        category: category.category,
        color: category.color,
        spent,
        suggested: Math.max(Math.ceil(spent), 500),
      };
    })
    .sort((a, b) => {
      if (b.spent !== a.spent) {
        return b.spent - a.spent;
      }

      return a.category.localeCompare(b.category);
    });
}

function getDefaultCategoryTargets(categoryItems: CategoryBudgetItem[]) {
  return Object.fromEntries(
    categoryItems.map((item) => [item.category, item.suggested.toFixed(0)])
  );
}

function mergeCategoryTargetsForMonth(
  storedTargets: Record<string, string> | undefined,
  categoryItems: CategoryBudgetItem[],
) {
  const defaultCategoryTargets = getDefaultCategoryTargets(categoryItems);

  return {
    ...defaultCategoryTargets,
    ...(storedTargets ?? {}),
  };
}

function getDefaultVisibleCategoryIds(categoryItems: CategoryBudgetItem[]) {
  return categoryItems.slice(0, 6).map((item) => item.id);
}

function mergeVisibleCategoryIdsForMonth(
  storedVisibleIds: string[] | undefined,
  categoryItems: CategoryBudgetItem[],
) {
  const defaultVisibleIds = getDefaultVisibleCategoryIds(categoryItems);
  const validVisibleIds = (storedVisibleIds ?? []).filter((id) =>
    categoryItems.some((item) => item.id === id)
  );

  if (validVisibleIds.length === 0 || validVisibleIds.length >= categoryItems.length) {
    return defaultVisibleIds;
  }

  return validVisibleIds.length > 0 ? validVisibleIds : defaultVisibleIds;
}

export default function BudgetPlanningBoard({
  initialBudget,
  currentExpenses,
  currentIncome,
  savingsGoalSeed,
  categoryDefinitions,
  completedTransactions,
  initialPreferences,
  demoMode = false,
}: BudgetPlanningBoardProps) {
  const today = new Date();
  const budgetTimeline = getBudgetTimeline(today, BUDGET_TIMELINE_MONTH_COUNT);
  const currentMonthKey = budgetTimeline[0]!.key;
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const allCategoryDefinitions = categoryDefinitions;
  const categoryMonthOptions = budgetTimeline.map((month) => ({
    value: month.key,
    label: getDisplayMonthLabel(month.key, currentMonthKey),
  }));
  const [selectedCategoryMonth, setSelectedCategoryMonth] = useState(currentMonthKey);
  const allCategoryItemsForMonth = buildCategoryItemsForMonth(
    selectedCategoryMonth,
    allCategoryDefinitions,
    completedTransactions
  );
  const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState("");
  const [visibleCategoryIds, setVisibleCategoryIds] = useState(() =>
    mergeVisibleCategoryIdsForMonth(
      initialPreferences.visibleCategoryIdsByMonth[currentMonthKey],
      allCategoryItemsForMonth
    )
  );
  const currentCategoryItems = allCategoryItemsForMonth.filter((item) =>
    visibleCategoryIds.includes(item.id)
  );
  const hiddenCategoryItems = allCategoryItemsForMonth.filter(
    (item) => !visibleCategoryIds.includes(item.id)
  );

  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [savedVisibleCategoryIdsByMonth, setSavedVisibleCategoryIdsByMonth] =
    useState(initialPreferences.visibleCategoryIdsByMonth);
  const [savedCategoryTargetsByMonth, setSavedCategoryTargetsByMonth] = useState(
    initialPreferences.categoryTargetsByMonth
  );
  const [monthlyBudgetValue, setMonthlyBudgetValue] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [goalValue, setGoalValue] = useState(savingsGoalSeed.toFixed(0));
  const [upcomingGoalTargets, setUpcomingGoalTargets] = useState<Record<string, string>>(
    () => {
      const defaultUpcomingGoals = getDefaultUpcomingGoalTargets(savingsGoalSeed);

      return {
        ...defaultUpcomingGoals,
        ...pickTimelineMonthValues(
          initialPreferences.savingsGoalTargets,
          getBudgetTimeline(new Date(), BUDGET_TIMELINE_MONTH_COUNT).map(
            (month) => month.key
          )
        ),
      };
    }
  );
  const [categoryTargets, setCategoryTargets] = useState<Record<string, string>>(
    () =>
      mergeCategoryTargetsForMonth(
        initialPreferences.categoryTargetsByMonth[currentMonthKey],
        currentCategoryItems
      )
  );
  const [upcomingBudgetTargets, setUpcomingBudgetTargets] = useState<Record<string, string>>(
    () => {
      const defaultUpcomingTargets = getDefaultUpcomingBudgetTargets(
        initialBudget?.amount ?? null,
        savingsGoalSeed
      );

      return {
        ...defaultUpcomingTargets,
        ...pickTimelineMonthValues(
          initialPreferences.monthlyBudgetTargets,
          getBudgetTimeline(new Date(), BUDGET_TIMELINE_MONTH_COUNT).map(
            (month) => month.key
          )
        ),
      };
    }
  );

  const {
    loading: isUpdatingMonthly,
    fn: updateBudgetFn,
  } = useFetch(updateBudget);
  const {
    loading: isSavingPreferences,
    fn: updateBudgetDashboardPreferencesFn,
  } = useFetch(updateBudgetDashboardPreferences);

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

  const persistPreferences = async ({
    nextBudgetTargets = upcomingBudgetTargets,
    nextGoalTargets = upcomingGoalTargets,
    nextCategoryTargetsByMonth = savedCategoryTargetsByMonth,
    nextVisibleCategoryIdsByMonth = savedVisibleCategoryIdsByMonth,
  }: {
    nextBudgetTargets?: Record<string, string>;
    nextGoalTargets?: Record<string, string>;
    nextCategoryTargetsByMonth?: Record<string, Record<string, string>>;
    nextVisibleCategoryIdsByMonth?: Record<string, string[]>;
  }) => {
    const result = await updateBudgetDashboardPreferencesFn({
      monthlyBudgetTargets: nextBudgetTargets,
      savingsGoalTargets: nextGoalTargets,
      categoryTargetsByMonth: nextCategoryTargetsByMonth,
      visibleCategoryIdsByMonth: nextVisibleCategoryIdsByMonth,
    });

    if (!result?.success) {
      throw new Error(result?.error ?? "Failed to save preferences");
    }
  };

  const handleMonthlySave = async () => {
    if (demoMode) {
      toast.info("Demo mode is read-only");
      return;
    }

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

      await persistPreferences({ nextBudgetTargets: nextTargets });
      setMonthlyBudgetValue(normalizedAmount);
      setUpcomingBudgetTargets(nextTargets);
      setIsEditingMonthly(false);
      toast.success("Monthly budget updated");
    } catch {
      toast.error("Failed to update monthly budget");
    }
  };

  const handleGoalSave = async () => {
    if (demoMode) {
      toast.info("Demo mode is read-only");
      return;
    }

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

    try {
      await persistPreferences({ nextGoalTargets: nextGoals });
      setGoalValue(normalizedAmount);
      setUpcomingGoalTargets(nextGoals);
      setIsEditingGoal(false);
      toast.success("Savings goal saved");
    } catch {
      toast.error("Failed to save savings goal");
    }
  };

  const handleCategoryTargetChange = (category: string, value: string) => {
    setCategoryTargets((current) => ({
      ...current,
      [category]: value,
    }));
  };

  const handleCategorySave = async () => {
    if (demoMode) {
      toast.info("Demo mode is read-only");
      return;
    }

    const nextCategoryTargetsByMonth = {
      ...savedCategoryTargetsByMonth,
      [selectedCategoryMonth]: categoryTargets,
    };
    const nextVisibleCategoryIdsByMonth = {
      ...savedVisibleCategoryIdsByMonth,
      [selectedCategoryMonth]: visibleCategoryIds,
    };

    try {
      await persistPreferences({
        nextCategoryTargetsByMonth,
        nextVisibleCategoryIdsByMonth,
      });
      setSavedCategoryTargetsByMonth(nextCategoryTargetsByMonth);
      setSavedVisibleCategoryIdsByMonth(nextVisibleCategoryIdsByMonth);
      setIsEditingCategory(false);
      setIsAddingCategory(false);
      toast.success("Category budget plan saved");
    } catch {
      toast.error("Failed to save category budget plan");
    }
  };

  const handleCategoryMonthChange = (monthKey: string) => {
    const monthItems = buildCategoryItemsForMonth(
      monthKey,
      allCategoryDefinitions,
      completedTransactions
    );

    setSelectedCategoryMonth(monthKey);
    setVisibleCategoryIds(
      mergeVisibleCategoryIdsForMonth(
        savedVisibleCategoryIdsByMonth[monthKey],
        monthItems
      )
    );
    setCategoryTargets(
      mergeCategoryTargetsForMonth(savedCategoryTargetsByMonth[monthKey], monthItems)
    );
    setSelectedCategoryToAdd("");
    setIsAddingCategory(false);
  };

  const handleAddCategory = () => {
    if (!selectedCategoryToAdd) {
      toast.error("Please select a category");
      return;
    }

    const alreadyVisible = visibleCategoryIds.includes(selectedCategoryToAdd);

    if (alreadyVisible) {
      toast.error("This category is already visible");
      return;
    }

    const nextVisibleCategoryIds = [...visibleCategoryIds, selectedCategoryToAdd];
    const monthItems = buildCategoryItemsForMonth(
      selectedCategoryMonth,
      allCategoryDefinitions,
      completedTransactions
    );

    setVisibleCategoryIds(nextVisibleCategoryIds);
    setCategoryTargets(
      mergeCategoryTargetsForMonth(
        savedCategoryTargetsByMonth[selectedCategoryMonth],
        monthItems
      )
    );
    setSelectedCategoryToAdd("");
    setIsAddingCategory(false);
    toast.success("Category added");
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
    const restoredTargets = {
      ...defaultUpcomingTargets,
      ...pickTimelineMonthValues(
        initialPreferences.monthlyBudgetTargets,
        budgetTimeline.map((month) => month.key)
      ),
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
    const restoredGoals = {
      ...defaultUpcomingGoals,
      ...pickTimelineMonthValues(
        initialPreferences.savingsGoalTargets,
        budgetTimeline.map((month) => month.key)
      ),
    };

    setGoalValue(savingsGoalSeed.toFixed(0));
    setUpcomingGoalTargets(restoredGoals);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-12 xl:items-stretch">
      <Card className="h-full border-violet-100 bg-white/95 xl:col-span-4 xl:h-[760px]">
        <CardHeader className="flex flex-col gap-3 p-5 pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Wallet className="h-4 w-4 text-violet-700" />
              Monthly Budget Set (All Accounts)
            </CardTitle>
            <p className="mt-2 text-sm text-violet-950/60">
              Set one total monthly spending limit and compare it with live expenses across all accounts.
            </p>
            {demoMode ? (
              <p className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Read-Only Demo
              </p>
            ) : null}
          </div>

          {!isEditingMonthly ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                demoMode
                  ? showDemoModeToast("editing monthly budgets")
                  : setIsEditingMonthly(true)
              }
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="flex h-full flex-col space-y-5 px-5 pb-5">
          {isEditingMonthly ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMonthlySave}
                  disabled={isUpdatingMonthly || isSavingPreferences}
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
                  disabled={isUpdatingMonthly || isSavingPreferences}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4 pb-6">
                <div className="mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Upcoming 7 Month Plan
                    </p>
                    <p className="mt-1 text-xs text-violet-950/60">
                      Set the current month first, then the next seven months.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
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
            <div className="flex h-full flex-col space-y-4">
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

              <div className="flex-1 rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-950">
                    Upcoming 7 Month Plan
                  </p>
                  <p className="mt-1 text-xs text-violet-950/60">
                    This rolling planner keeps the current month plus the next seven months ready.
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

      <Card className="h-full border-violet-100 bg-white/95 xl:col-span-4 xl:h-[760px]">
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
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Select
              value={selectedCategoryMonth}
              onValueChange={handleCategoryMonthChange}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {categoryMonthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          {!isEditingCategory ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  demoMode
                    ? showDemoModeToast("editing category budgets")
                    : setIsEditingCategory(true)
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <div className="ml-auto flex items-center gap-2 sm:ml-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCategorySave}
                  disabled={isSavingPreferences}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const monthItems = buildCategoryItemsForMonth(
                      selectedCategoryMonth,
                      allCategoryDefinitions,
                      completedTransactions
                    );
                    setVisibleCategoryIds(
                      mergeVisibleCategoryIdsForMonth(
                        savedVisibleCategoryIdsByMonth[selectedCategoryMonth],
                        monthItems
                      )
                    );
                    setCategoryTargets(
                      mergeCategoryTargetsForMonth(
                        savedCategoryTargetsByMonth[selectedCategoryMonth],
                        monthItems
                      )
                    );
                    setSelectedCategoryToAdd("");
                    setIsAddingCategory(false);
                    setIsEditingCategory(false);
                  }}
                  disabled={isSavingPreferences}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 overflow-hidden px-5 pb-6">
          {isEditingCategory ? (
            <>
              <div className="flex justify-stretch sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 sm:w-auto"
                  onClick={() => setIsAddingCategory(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>

              <div className="grid max-h-[620px] gap-3 overflow-y-auto overscroll-contain px-1 py-1 pb-6 pr-2 md:grid-cols-2">
                {currentCategoryItems.map((item) => {
                  const target = Number(categoryTargets[item.category] || 0);
                  const spentPercent =
                    target > 0 ? Math.min((item.spent / target) * 100, 100) : 0;
                  const progressStyles =
                    target <= 0
                      ? "bg-violet-400"
                      : item.spent > target
                        ? "bg-red-500"
                        : spentPercent >= 100
                          ? "bg-emerald-500"
                          : spentPercent >= 80
                            ? "bg-amber-500"
                            : "bg-emerald-500";

                  return (
                    <div
                      key={item.category}
                      className="rounded-2xl border border-violet-100 bg-violet-50/55 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-950">
                            {item.category}
                          </p>
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
                        <Progress
                          value={spentPercent}
                          className="h-1.5"
                          extraStyles={progressStyles}
                        />
                        <div className="flex items-center justify-between text-[11px] text-violet-950/60">
                          <span>Target {formatCurrency(target)}</span>
                          <span>{spentPercent.toFixed(0)}% used</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-h-[620px] space-y-5 overflow-y-auto overscroll-contain px-1 py-1 pr-2 pb-6">
              {currentCategoryItems.map((item) => {
                const target = Number(categoryTargets[item.category] || 0);
                const spentPercent =
                  target > 0 ? Math.min((item.spent / target) * 100, 100) : 0;
                const progressStyles =
                  target <= 0
                    ? "bg-violet-400"
                    : item.spent > target
                      ? "bg-red-500"
                      : spentPercent >= 100
                        ? "bg-emerald-500"
                        : spentPercent >= 80
                          ? "bg-amber-500"
                          : "bg-emerald-500";

                return (
                  <div
                    key={item.category}
                    className="snap-start space-y-2 rounded-xl border border-violet-100/60 bg-white/70 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-950">
                        {item.category}
                      </span>
                      <span className="text-violet-950/65">
                        {formatCurrency(target)}
                      </span>
                    </div>
                    <Progress
                      value={spentPercent}
                      className="h-1.5"
                      extraStyles={progressStyles}
                    />
                    <div className="flex items-center justify-between text-[11px] text-violet-950/60">
                      <span>Spent {formatCurrency(item.spent)} this month</span>
                      <span>{spentPercent.toFixed(0)}% used</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditingCategory && isAddingCategory ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-5 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-950">
                Add Category
              </h3>
              <p className="mt-1 text-sm text-violet-950/60">
                Choose from the remaining built-in expense categories for this month.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-violet-700">
                  Remaining Categories
                </p>
                <Select
                  value={selectedCategoryToAdd}
                  onValueChange={setSelectedCategoryToAdd}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        hiddenCategoryItems.length > 0
                          ? "Select a category to add"
                          : "No remaining categories"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {hiddenCategoryItems.length > 0 ? (
                      hiddenCategoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.category}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none__" disabled>
                        No remaining categories
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  className="bg-slate-950 text-white hover:bg-slate-900"
                  onClick={handleAddCategory}
                  disabled={hiddenCategoryItems.length === 0 || !selectedCategoryToAdd}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelectedCategoryToAdd("");
                    setIsAddingCategory(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Card className="h-full border-violet-100 bg-white/95 xl:col-span-4 xl:h-[760px]">
        <CardHeader className="flex flex-row items-start justify-between p-5 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Target className="h-4 w-4 text-violet-700" />
              Goal Saving
            </CardTitle>
            {!isEditingGoal ? (
              <p className="mt-2 text-sm text-violet-950/60">
                Set the current month first, then keep the next seven savings goals ready.
              </p>
            ) : null}
          </div>

          {!isEditingGoal ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                demoMode
                  ? showDemoModeToast("editing savings goals")
                  : setIsEditingGoal(true)
              }
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoalSave}
                disabled={isSavingPreferences}
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
                disabled={isSavingPreferences}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex h-full flex-col space-y-4 px-5 pb-5">
          {isEditingGoal ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
                <div className="space-y-4 pr-2 pb-4">
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
                <div className="max-h-[500px] space-y-4 overflow-y-auto overscroll-contain pr-2 pb-4">
                  {budgetTimeline.map((month, index) => {
                    const plannedGoal = Number(upcomingGoalTargets[month.key] || 0);
                    const progressValue =
                      month.key === currentMonthKey ? goalProgress : 100;
                    const progressStyles =
                      month.key !== currentMonthKey
                        ? "bg-violet-200"
                        : plannedGoal <= 0
                          ? "bg-violet-400"
                          : currentSavings > plannedGoal
                            ? "bg-emerald-500"
                            : goalProgress >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-500";

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
