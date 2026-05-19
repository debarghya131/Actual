import BudgetPlanningBoard from "@/app/(main)/dashboard/_components/budget-planning-board";
import {
  demoBudget,
  demoCategories,
  demoDashboardPreferences,
  demoTransactions,
} from "@/lib/demo-data";

export default function DemoBudgetsPage() {
  const currentMonth = new Date();

  const currentExpenses = demoTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "EXPENSE" &&
        transactionDate.getMonth() === currentMonth.getMonth() &&
        transactionDate.getFullYear() === currentMonth.getFullYear()
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  const currentIncome = demoTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "INCOME" &&
        transactionDate.getMonth() === currentMonth.getMonth() &&
        transactionDate.getFullYear() === currentMonth.getFullYear()
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <section className="min-h-full w-full">
      <div className="w-full rounded-[28px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] sm:p-8">
        <BudgetPlanningBoard
          initialBudget={demoBudget}
          currentExpenses={currentExpenses}
          currentIncome={currentIncome}
          savingsGoalSeed={5000}
          categoryDefinitions={demoCategories
            .filter((category) => category.type === "EXPENSE")
            .map((category) => ({
              id: category.id,
              category: category.name,
              color: category.color,
            }))}
          completedTransactions={demoTransactions}
          initialPreferences={demoDashboardPreferences}
          demoMode
        />
      </div>
    </section>
  );
}
