import { redirect } from "next/navigation";

import BudgetPlanningBoard from "@/app/(main)/dashboard/_components/budget-planning-board";
import { defaultCategories } from "@/data/categories";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

export default async function BudgetsPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [budget, transactions] = await Promise.all([
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

  const savingsGoalSeed = Math.max(currentIncome * 0.2, 5000);

  return (
    <section className="min-h-full w-full">
      <div className="w-full rounded-[28px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] sm:p-8">
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
        />
      </div>
    </section>
  );
}
