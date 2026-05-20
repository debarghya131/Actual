import BudgetProgress from "@/app/(main)/dashboard/_components/budget-progress";
import DashboardOverview from "@/app/(main)/dashboard/_components/transaction-overview";
import {
  demoAccounts,
  demoBudget,
  demoDashboardPreferences,
  demoTransactions,
} from "@/lib/demo-data";

export default function DemoDashboardPage() {
  const accounts = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
    isDefault: account.isDefault,
  }));

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

  return (
    <div className="min-w-0 space-y-5 md:space-y-6">
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
      />
    </div>
  );
}
