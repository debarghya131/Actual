import BudgetProgress from "@/app/(main)/dashboard/_components/budget-progress";
import DashboardOverview from "@/app/(main)/dashboard/_components/transaction-overview";
import {
  demoAccounts,
  demoBudget,
  DEMO_REFERENCE_DATE,
  DEMO_REFERENCE_MONTH_KEY,
  getDemoDashboardPreferences,
  getDemoTransactions,
} from "@/lib/demo-data";

export default function DemoDashboardPage() {
  const demoTransactions = getDemoTransactions();
  const demoDashboardPreferences = getDemoDashboardPreferences();
  const accounts = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
    isDefault: account.isDefault,
  }));

  const currentExpenses = demoTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "EXPENSE" &&
        transactionDate.getMonth() === DEMO_REFERENCE_DATE.getMonth() &&
        transactionDate.getFullYear() === DEMO_REFERENCE_DATE.getFullYear()
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:min-h-0 space-y-3.5 sm:space-y-4">
      <BudgetProgress
        initialBudget={demoBudget}
        currentExpenses={currentExpenses}
        manageHref="/demo/dashboard/budgets"
        manageLabel="Preview"
      />

      <DashboardOverview
        accounts={accounts}
        transactions={demoTransactions}
        preferences={demoDashboardPreferences}
        referenceMonthKey={DEMO_REFERENCE_MONTH_KEY}
      />
    </div>
  );
}
