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
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [budget, transactions] = await Promise.all([
    db.budget.findUnique({
      where: { userId: user.id },
    }),
    db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const serializedTransactions = transactions.map((transaction) => ({
    type: transaction.type,
    amount: Number(transaction.amount),
    category: transaction.category,
  }));

  const currentExpenses = serializedTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const currentIncome = serializedTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseCategories = defaultCategories.filter(
    (category) => category.type === "EXPENSE"
  );

  const categoryItems = expenseCategories
    .map((category) => {
      const spent = serializedTransactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE" &&
            transaction.category.toLowerCase() === category.id.toLowerCase()
        )
        .reduce((total, transaction) => total + transaction.amount, 0);

      return {
        category: category.name,
        color: category.color,
        spent,
        suggested: Math.max(spent, 500),
      };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);

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
          categoryItems={categoryItems}
        />
      </div>
    </section>
  );
}
