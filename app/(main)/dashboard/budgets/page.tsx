import { redirect } from "next/navigation";

import BudgetPlanningBoard from "@/app/(main)/dashboard/_components/budget-planning-board";
import { defaultCategories } from "@/data/categories";
import { checkUser } from "@/lib/checkUser";
import {
  EMPTY_DASHBOARD_PREFERENCES,
  getDashboardPreferences,
} from "@/lib/dashboard-preferences";
import { db } from "@/lib/prisma";

export default async function BudgetsPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [budget, transactions, dashboardPreferences] = await Promise.all([
    db.budget.findUnique({
      where: { userId: user.id },
    }),
    db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      orderBy: { date: "desc" },
    }),
    getDashboardPreferences(user.id),
  ]);

  const serializedTransactions = transactions.map((transaction) => ({
    type: transaction.type,
    amount: Number(transaction.amount),
    category: transaction.category,
    date: transaction.date.toISOString(),
  }));

  const currentExpenses = serializedTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "EXPENSE" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  const currentIncome = serializedTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "INCOME" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseCategories = defaultCategories.filter(
    (category) => category.type === "EXPENSE"
  );
  const isFreshBudgetExperience = !budget && transactions.length === 0;

  const savingsGoalSeed = currentIncome > 0 ? Math.max(currentIncome * 0.2, 5000) : 0;

  return (
    <div className="flex h-full min-h-full w-full flex-1 flex-col min-w-0 lg:min-h-0">
      <BudgetPlanningBoard
        initialBudget={
          budget
            ? {
                id: budget.id,
                amount: Number(budget.amount),
              }
            : null
        }
        currentExpenses={currentExpenses}
        currentIncome={currentIncome}
        savingsGoalSeed={savingsGoalSeed}
        categoryDefinitions={expenseCategories.map((category) => ({
          id: category.id,
          category: category.name,
          color: category.color,
        }))}
        completedTransactions={serializedTransactions}
        initialPreferences={
          isFreshBudgetExperience
            ? EMPTY_DASHBOARD_PREFERENCES
            : dashboardPreferences
        }
      />
    </div>
  );
}
