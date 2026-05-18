import { redirect } from "next/navigation";

import { AccountChart } from "@/app/(main)/account/_components/account-chart";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [accounts, transactions] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  const chartAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));

  const chartTransactions = transactions.map((transaction) => ({
    accountId: transaction.accountId,
    date: transaction.date.toISOString(),
    type: transaction.type,
    amount: Number(transaction.amount),
  }));

  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl space-y-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
            Analysis
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Transaction Analytics
          </h1>
          <p className="mt-4 text-base leading-8 text-violet-950/65">
            Review income, expenses, and net movement across your transactions.
          </p>
        </div>

        <AccountChart
          accounts={chartAccounts}
          transactions={chartTransactions}
        />
      </div>
    </section>
  );
}
