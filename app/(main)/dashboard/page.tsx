import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import AccountCard from "./_components/account-card";
import BudgetProgress from "./_components/budget-progress";
import DashboardOverview from "./_components/transaction-overview";
import CreateAccountDrawer from "@/components/create-account-drawer";

export default async function DashboardPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [rawAccounts, rawTransactions, rawBudget] = await Promise.all([
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

  const defaultAccount = accounts.find((account) => account.isDefault) ?? accounts[0];
  const currentMonth = new Date();
  const currentExpenses = transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transaction.type === "EXPENSE" &&
        transaction.accountId === defaultAccount?.id &&
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
    <div className="space-y-8">
      <BudgetProgress
        initialBudget={budget}
        currentExpenses={currentExpenses}
      />

      <DashboardOverview accounts={accounts} transactions={transactions} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <button
            type="button"
            className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-violet-200 bg-white p-6 text-muted-foreground transition hover:shadow-md"
          >
            <Plus className="mb-2 h-10 w-10" />
            <span className="text-sm font-medium">Add New Account</span>
          </button>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
}
