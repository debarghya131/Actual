import { redirect } from "next/navigation";

import { checkUser } from "@/lib/checkUser";
import { getDashboardPreferences } from "@/lib/dashboard-preferences";
import { db } from "@/lib/prisma";
import BudgetProgress from "./_components/budget-progress";
import DashboardOverview from "./_components/transaction-overview";

export default async function DashboardPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [rawAccounts, rawTransactions, rawBudget, dashboardPreferences] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    db.budget.findUnique({
      where: { userId: user.id },
    }),
    getDashboardPreferences(user.id),
  ]);

  const accounts = rawAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: Number(account.balance),
    isDefault: account.isDefault,
  }));

  const transactions = rawTransactions.map((transaction) => ({
    id: transaction.id,
    accountId: transaction.accountId,
    type: transaction.type,
    amount: Number(transaction.amount),
    description: transaction.description,
    date: transaction.date.toISOString(),
    category: transaction.category,
  }));

  const currentMonth = new Date();
  const currentExpenses = transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "EXPENSE" &&
        transactionDate.getMonth() === currentMonth.getMonth() &&
        transactionDate.getFullYear() === currentMonth.getFullYear()
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  const budget = rawBudget
    ? {
        id: rawBudget.id,
        amount: Number(rawBudget.amount),
      }
    : null;

  return (
    <div className="space-y-6">
      <BudgetProgress
        initialBudget={budget}
        currentExpenses={currentExpenses}
      />

      <DashboardOverview
        accounts={accounts}
        transactions={transactions}
        preferences={dashboardPreferences}
      />
    </div>
  );
}
