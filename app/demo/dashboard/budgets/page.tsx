import BudgetPlanningBoard from "@/app/(main)/dashboard/_components/budget-planning-board";
import {
  demoBudget,
  demoCategories,
  DEMO_REFERENCE_DATE,
  getDemoDashboardPreferences,
  getDemoTransactions,
} from "@/lib/demo-data";

export default function DemoBudgetsPage() {
  const currentMonth = DEMO_REFERENCE_DATE;
  const demoTransactions = getDemoTransactions();
  const demoDashboardPreferences = getDemoDashboardPreferences();

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
    <div className="flex h-full min-h-full w-full flex-1 flex-col min-w-0 lg:min-h-0">
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
        referenceDate={DEMO_REFERENCE_DATE.toISOString()}
        demoMode
      />
    </div>
  );
}
