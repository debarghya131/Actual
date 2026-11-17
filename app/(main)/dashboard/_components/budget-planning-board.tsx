"use client";

import { useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
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
import { cn } from "@/lib/utils";

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
  referenceDate?: string;
  demoMode?: boolean;
};

const BUDGET_TIMELINE_MONTH_COUNT = 7;

const withDemoModeHint = (message: string) =>
  `${message} Explore Try Demo mode.`;

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

function getDefaultUpcomingGoalTargets(seedAmount: number, baseDate: Date) {
  const defaultGoalAmount = seedAmount > 0 ? seedAmount.toFixed(0) : "";

  return Object.fromEntries(
    getBudgetTimeline(baseDate, BUDGET_TIMELINE_MONTH_COUNT).map((month) => [
      month.key,
      defaultGoalAmount,
    ])
  );
}

function getDefaultUpcomingBudgetTargets(
  initialAmount: number | null,
  fallbackAmount: number,
  baseDate: Date,
) {
  const resolvedAmount = initialAmount ?? fallbackAmount;
  const defaultAmount = resolvedAmount > 0 ? resolvedAmount.toFixed(0) : "";

  return Object.fromEntries(
    getBudgetTimeline(baseDate, BUDGET_TIMELINE_MONTH_COUNT).map((month) => [
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
        suggested: spent > 0 ? Math.ceil(spent) : 0,
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
  const hasLiveSpending = categoryItems.some((item) => item.spent > 0);

  if (!hasLiveSpending) {
    return [];
  }

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
  referenceDate,
  demoMode = false,
}: BudgetPlanningBoardProps) {
  const today = referenceDate ? new Date(referenceDate) : new Date();
  const budgetTimeline = getBudgetTimeline(today, BUDGET_TIMELINE_MONTH_COUNT);
  const currentMonthKey = budgetTimeline[0]!.key;
  const [mobileBudgetSection, setMobileBudgetSection] = useState<
    "monthly" | "categories" | "goals"
  >("monthly");
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
  const [goalValue, setGoalValue] = useState(
    savingsGoalSeed > 0 ? savingsGoalSeed.toFixed(0) : ""
  );
  const [upcomingGoalTargets, setUpcomingGoalTargets] = useState<Record<string, string>>(
    () => {
      const defaultUpcomingGoals = getDefaultUpcomingGoalTargets(savingsGoalSeed, today);

      return {
        ...defaultUpcomingGoals,
        ...pickTimelineMonthValues(
          initialPreferences.savingsGoalTargets,
          getBudgetTimeline(today, BUDGET_TIMELINE_MONTH_COUNT).map(
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
        savingsGoalSeed,
        today,
      );

      return {
        ...defaultUpcomingTargets,
        ...pickTimelineMonthValues(
          initialPreferences.monthlyBudgetTargets,
          getBudgetTimeline(today, BUDGET_TIMELINE_MONTH_COUNT).map(
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
  const hasMonthlyBudgetPlan =
    effectiveBudgetAmount > 0 ||
    budgetTimeline.some((month) => Number(upcomingBudgetTargets[month.key] || 0) > 0);
  const hasSavingsGoalPlan =
    savingsGoal > 0 ||
    budgetTimeline.some((month) => Number(upcomingGoalTargets[month.key] || 0) > 0);
  const hasCategoryBudgetPlan = currentCategoryItems.length > 0;

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
    } catch (error) {
      toast.error(
        withDemoModeHint(
          error instanceof Error
            ? error.message
            : "Failed to update monthly budget"
        )
      );
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
    } catch (error) {
      toast.error(
        withDemoModeHint(
          error instanceof Error ? error.message : "Failed to save savings goal"
        )
      );
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
    } catch (error) {
      toast.error(
        withDemoModeHint(
          error instanceof Error
            ? error.message
            : "Failed to save category budget plan"
        )
      );
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
      savingsGoalSeed,
      today,
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
      "";

    setUpcomingBudgetTargets(restoredTargets);
    setMonthlyBudgetValue(currentBudgetTarget);
  };

  const restoreGoalTargets = () => {
    const defaultUpcomingGoals = getDefaultUpcomingGoalTargets(savingsGoalSeed, today);
    const restoredGoals = {
      ...defaultUpcomingGoals,
      ...pickTimelineMonthValues(
        initialPreferences.savingsGoalTargets,
        budgetTimeline.map((month) => month.key)
      ),
    };

    setGoalValue(savingsGoalSeed > 0 ? savingsGoalSeed.toFixed(0) : "");
    setUpcomingGoalTargets(restoredGoals);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="grid min-w-0 flex-1 grid-cols-1 gap-3.5 sm:gap-4 md:gap-5 xl:grid-cols-3 xl:items-stretch xl:h-full xl:min-h-0"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
      <div className="col-span-full grid grid-cols-3 gap-1 rounded-2xl border border-violet-100 bg-white/90 p-1 shadow-2xs xl:hidden shrink-0">
        {([
          ["monthly", "Monthly", Wallet],
          ["categories", "Categories", PiggyBank],
          ["goals", "Goals", Target],
        ] as const).map(([section, label, Icon]) => (
          <button
            key={section}
            type="button"
            aria-pressed={mobileBudgetSection === section}
            onClick={() => setMobileBudgetSection(section)}
            className={cn(
              "flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-1.5 text-xs font-semibold leading-tight transition",
              mobileBudgetSection === section
                ? "bg-violet-700 text-white shadow-xs"
                : "text-violet-800 hover:bg-violet-50"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      <m.div
        className={cn(
          "min-w-0 xl:h-full xl:min-h-0 flex flex-col",
          mobileBudgetSection === "monthly" ? "flex" : "hidden xl:flex"
        )}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
      <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
          <div className="min-w-0">
            <CardTitle className="flex min-w-0 items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              <Wallet className="h-4 w-4 text-violet-700 shrink-0" />
              <span className="min-w-0 truncate">Monthly Budget Set (All Accounts)</span>
            </CardTitle>
            <p className="mt-0.5 text-[11px] text-slate-500 font-medium truncate">
              Set monthly spending limit across all accounts.
            </p>
            {demoMode ? (
              <p className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.2 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
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
              className="h-8 w-8 shrink-0 rounded-lg text-violet-700 hover:bg-violet-100/80"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-1 min-h-0 flex-col p-3 sm:p-4 overflow-hidden gap-3">
          {isEditingMonthly ? (
            <div className="space-y-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto modern-scrollbar xl:pr-2">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9"
                  onClick={handleMonthlySave}
                  disabled={isUpdatingMonthly || isSavingPreferences}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9"
                  onClick={() => {
                    restoreBudgetTargets();
                    setIsEditingMonthly(false);
                  }}
                  disabled={isUpdatingMonthly || isSavingPreferences}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-3 pb-4 min-[420px]:p-3.5">
                <div className="mb-2.5">
                  <p className="text-xs sm:text-sm font-semibold text-slate-950">
                    Upcoming 6 Month Plan
                  </p>
                  <p className="mt-0.5 text-[11px] text-violet-950/60 font-medium">
                    Set the current month first, then the next six months.
                  </p>
                </div>

                <div className="grid min-w-0 gap-2.5 sm:grid-cols-2">
                  {budgetTimeline.map((month, index) => (
                    <div
                      key={month.key}
                      className="min-w-0 rounded-xl border border-violet-100 bg-white p-2.5 sm:p-3"
                    >
                      <p className="text-xs font-semibold text-slate-950 truncate">
                        {index === 0 ? `${month.label} (Current)` : month.label}
                      </p>
                      <Input
                        type="number"
                        value={upcomingBudgetTargets[month.key] || ""}
                        onChange={(e) =>
                          handleUpcomingBudgetChange(month.key, e.target.value)
                        }
                        placeholder="Set month budget"
                        className="mt-2 h-9 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-1 flex-col space-y-3">
              <div className="grid min-w-0 gap-2 grid-cols-2 min-[420px]:grid-cols-3 shrink-0">
                <StatTile
                  label="Budget"
                  value={
                    hasMonthlyBudgetPlan
                      ? formatCurrency(effectiveBudgetAmount)
                      : "Not set yet"
                  }
                />
                <StatTile
                  label="Spent"
                  value={formatCurrency(currentExpenses)}
                />
                <StatTile
                  label="Remaining"
                  value={
                    hasMonthlyBudgetPlan
                      ? formatCurrency(
                          Math.max(effectiveBudgetAmount - currentExpenses, 0)
                        )
                      : "—"
                  }
                  className="col-span-2 min-[420px]:col-span-1"
                />
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-violet-100 bg-violet-50/45 p-3 flex min-h-0 flex-col overflow-hidden">
                <div className="mb-2.5 shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-950">
                    Upcoming 6 Month Plan
                  </p>
                  <p className="mt-0.5 text-[11px] text-violet-950/60 font-medium">
                    Rolling plan for the current month plus six months.
                  </p>
                </div>

                {hasMonthlyBudgetPlan ? (
                <div className="min-w-0 space-y-2 flex-1 min-h-0 overflow-y-auto modern-scrollbar pr-1 sm:pr-1.5 max-h-[320px] xl:max-h-none">
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
                      <div
                        key={month.key}
                        className={`space-y-1.5 rounded-xl px-2.5 py-2 transition ${
                          month.key === currentMonthKey
                            ? "bg-violet-100/65 ring-1 ring-violet-300/55 shadow-xs"
                            : "hover:bg-violet-100/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold gap-2">
                          <span className="truncate text-slate-900">
                            {index === 0 ? `${month.label} (Current)` : month.label}
                          </span>
                          <span className="shrink-0 text-violet-950/70 font-medium">
                            {plannedBudget > 0
                              ? formatCurrency(plannedBudget)
                              : "Not set yet"}
                          </span>
                        </div>
                        <GlowProgress
                          value={month.key === currentMonthKey ? progressValue : 100}
                          className="h-1.5"
                          extraStyles={progressStyles}
                        />
                      </div>
                    );
                  })}
                </div>
                ) : (
                  <EmptyBudgetState
                    title="No monthly budget set yet"
                    description="Start by setting your first monthly budget target. The next six months will stay ready after that."
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </m.div>

      <m.div
        className={cn(
          "min-w-0 xl:h-full xl:min-h-0 flex flex-col",
          mobileBudgetSection === "categories" ? "flex" : "hidden xl:flex"
        )}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
      <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
        <CardHeader className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
          <div className="min-w-0">
            <CardTitle className="flex min-w-0 items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              <PiggyBank className="h-4 w-4 text-violet-700 shrink-0" />
              <span className="min-w-0 truncate">Category-wise Budget Set</span>
            </CardTitle>
            <p className="mt-1 break-words text-xs leading-5 text-slate-500 font-medium">
              Plan category caps based on actual monthly spending patterns.
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:flex-nowrap sm:justify-end">
            {isEditingCategory ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 gap-1.5 border-violet-200 text-xs text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
              </Button>
            ) : null}
            <Select
              value={selectedCategoryMonth}
              onValueChange={handleCategoryMonthChange}
            >
              <SelectTrigger className="h-8 min-w-0 flex-1 text-xs bg-violet-50/50 border-violet-200 sm:w-[9.5rem] sm:flex-none">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {categoryMonthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value} className="text-xs">
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isEditingCategory ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-violet-700 hover:bg-violet-100/80"
                onClick={() =>
                  demoMode
                    ? showDemoModeToast("editing category budgets")
                    : setIsEditingCategory(true)
                }
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                  onClick={handleCategorySave}
                  disabled={isSavingPreferences}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50"
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
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 min-h-0 flex-col p-3 sm:p-4 overflow-hidden gap-3">
          {isEditingCategory ? (
            <div className="grid min-w-0 grid-cols-1 gap-2.5 p-0.5 flex-1 min-h-0 overflow-y-auto modern-scrollbar pr-1 sm:pr-1.5 max-h-[380px] xl:max-h-none">
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
                    className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/55 p-2.5 sm:p-3 transition duration-200 hover:bg-violet-100/40"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-950 truncate">
                          {item.category}
                        </p>
                        <p className="mt-0.5 text-[11px] text-violet-950/60 font-medium">
                          Spent {formatCurrency(item.spent)} this month
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        Live
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <Input
                        type="number"
                        value={categoryTargets[item.category] || ""}
                        onChange={(e) =>
                          handleCategoryTargetChange(item.category, e.target.value)
                        }
                        placeholder="Set category budget"
                        className="h-8 text-xs"
                      />
                      <GlowProgress
                        value={spentPercent}
                        className="h-1.5"
                        extraStyles={progressStyles}
                      />
                      <div className="flex min-w-0 items-center justify-between text-[11px] text-violet-950/60 font-medium">
                        <span className="truncate">Target: {formatCurrency(target)}</span>
                        <span className="shrink-0">{spentPercent.toFixed(0)}% used</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            hasCategoryBudgetPlan ? (
            <div className="min-w-0 space-y-2 flex-1 min-h-0 overflow-y-auto modern-scrollbar pr-1 sm:pr-1.5 max-h-[380px] xl:max-h-none">
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
                    className="space-y-1.5 rounded-xl border border-violet-100/70 bg-violet-50/45 px-3 py-2 sm:py-2.5 transition duration-200 hover:bg-violet-100/40"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold gap-2">
                      <span className="truncate text-slate-900">
                        {item.category}
                      </span>
                      <span className="shrink-0 text-violet-950/70 font-medium">
                        {formatCurrency(target)}
                      </span>
                    </div>
                    <GlowProgress
                      value={spentPercent}
                      className="h-1.5"
                      extraStyles={progressStyles}
                    />
                    <div className="flex items-center justify-between text-[11px] text-violet-950/60 font-medium">
                      <span className="truncate">Spent {formatCurrency(item.spent)} this month</span>
                      <span className="shrink-0">{spentPercent.toFixed(0)}% used</span>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              <EmptyBudgetState
                title="No category budget plan yet"
                description="Add your first category budget after you start tracking expenses or open edit mode to set categories manually."
              />
            )
          )}
        </CardContent>
      </Card>
      </m.div>

      {isEditingCategory && isAddingCategory ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
          role="dialog"
        >
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-violet-100 bg-white p-4 shadow-2xl min-[420px]:p-5">
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
                  <SelectTrigger className="min-h-12 w-full sm:min-h-10">
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

              <div className="flex flex-col-reverse gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-end">
                <Button
                  type="button"
                  className="min-h-12 bg-slate-950 text-white hover:bg-slate-900"
                  onClick={handleAddCategory}
                  disabled={hiddenCategoryItems.length === 0 || !selectedCategoryToAdd}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-12"
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

      <m.div
        className={cn(
          "min-w-0 xl:h-full xl:min-h-0 flex flex-col",
          mobileBudgetSection === "goals" ? "flex" : "hidden xl:flex"
        )}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
      <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_16px_40px_-24px_rgba(109,40,217,0.18)] backdrop-blur-md rounded-2xl sm:rounded-3xl transition duration-300 hover:border-violet-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-violet-50/90 px-3.5 py-3 sm:px-4 sm:py-3.5 shrink-0 space-y-0">
          <div className="min-w-0">
            <CardTitle className="flex min-w-0 items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              <Target className="h-4 w-4 text-violet-700 shrink-0" />
              <span className="min-w-0 truncate">Goal Saving</span>
            </CardTitle>
            <p className="mt-0.5 text-[11px] text-slate-500 font-medium truncate">
              Keep current month and six month savings goals ready.
            </p>
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
              className="h-8 w-8 shrink-0 rounded-lg text-violet-700 hover:bg-violet-100/80"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                onClick={handleGoalSave}
                disabled={isSavingPreferences}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50"
                onClick={() => {
                  restoreGoalTargets();
                  setIsEditingGoal(false);
                }}
                disabled={isSavingPreferences}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-1 min-h-0 flex-col p-3 sm:p-4 overflow-hidden gap-3">
          {isEditingGoal ? (
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto modern-scrollbar pr-1 sm:pr-1.5 max-h-[360px] xl:max-h-none">
              <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-3">
                <div className="min-w-0 space-y-3">
                  {budgetTimeline.map((month, index) => (
                    <div key={month.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold gap-2">
                        <span className="truncate text-slate-900">
                          {index === 0 ? `${month.label} (Current)` : month.label}
                        </span>
                        <span className="shrink-0 text-violet-950/65 font-medium">
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
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-1 flex-col space-y-3">
              <div className="grid min-w-0 gap-2 grid-cols-2 shrink-0">
                <StatTile
                  label="Current savings"
                  value={formatCurrency(currentSavings)}
                />
                <StatTile
                  label="Goal target"
                  value={
                    hasSavingsGoalPlan
                      ? formatCurrency(savingsGoal)
                      : "Not set yet"
                  }
                />
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-violet-100 bg-violet-50/45 p-3 flex min-h-0 flex-col overflow-hidden">
                <div className="mb-2.5 shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-950">
                    Upcoming 6 Month Plan
                  </p>
                  <p className="mt-0.5 text-[11px] text-violet-950/60 font-medium">
                    Rolling plan for the current month plus six months.
                  </p>
                </div>
                {hasSavingsGoalPlan ? (
                <div className="min-w-0 space-y-2 flex-1 min-h-0 overflow-y-auto modern-scrollbar pr-1 sm:pr-1.5 max-h-[320px] xl:max-h-none">
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
                      <div
                        key={month.key}
                        className={`space-y-1.5 rounded-xl px-2.5 py-2 transition ${
                          month.key === currentMonthKey
                            ? "bg-violet-100/65 ring-1 ring-violet-300/55 shadow-xs"
                            : "hover:bg-violet-100/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold gap-2">
                          <span className="truncate text-slate-900">
                            {index === 0 ? `${month.label} (Current)` : month.label}
                          </span>
                          <span className="shrink-0 text-violet-950/70 font-medium">
                            {plannedGoal > 0
                              ? formatCurrency(plannedGoal)
                              : "Not set yet"}
                          </span>
                        </div>
                        <GlowProgress
                          value={progressValue}
                          className="h-1.5"
                          extraStyles={progressStyles}
                        />
                      </div>
                    );
                  })}
                </div>
                ) : (
                  <EmptyBudgetState
                    title="No savings goal set yet"
                    description="Set a current-month goal first, then use this planner to extend your savings targets across the next six months."
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </m.div>

    </m.div>
    </LazyMotion>
  );
}

function GlowProgress({
  value,
  className,
  extraStyles,
}: {
  value: number;
  className?: string;
  extraStyles?: string;
}) {
  return (
    <m.div
      className="relative overflow-hidden rounded-full"
      initial={{ opacity: 0, scaleX: 0.86 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "left center" }}
    >
      <Progress value={value} className={className} extraStyles={extraStyles} />
      <m.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/55 to-transparent"
        animate={{ x: ["-130%", "620%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />
    </m.div>
  );
}

function StatTile({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-violet-100 bg-violet-50/55 p-2.5 min-[420px]:p-3${className ? ` ${className}` : ""}`}>
      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-700">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-bold leading-tight text-slate-950 min-[420px]:text-base sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function EmptyBudgetState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-white/70 px-4 py-8 text-center min-[420px]:px-6">
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-violet-950/60">{description}</p>
      </div>
    </div>
  );
}
