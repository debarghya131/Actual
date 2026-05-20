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
    category: transaction.category,
  }));

  return (
    <section className="min-h-full w-full overflow-x-hidden px-3 py-4 min-[420px]:px-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 lg:space-y-8">
        <AccountChart
          accounts={chartAccounts}
          transactions={chartTransactions}
        />
      </div>
    </section>
  );
}
