import { redirect } from "next/navigation";

import DashboardPageShell from "@/components/dashboard-page-shell";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NoPaginationTransactionTable } from "../account/_components/no-pagination-transaction-table";

export default async function TransactionPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const serializedTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    description: transaction.description,
    date: transaction.date.toISOString(),
    category: transaction.category,
    isRecurring: transaction.isRecurring,
    recurringInterval: transaction.recurringInterval,
    nextRecurringDate: transaction.nextRecurringDate?.toISOString() ?? null,
  }));

  return (
    <DashboardPageShell
      eyebrow="Transactions"
      title="Capture and review money movement"
      description="Add new transactions, monitor recent activity, and keep your records organized without leaving the dashboard."
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Recent Activity
          </h2>
          <p className="mt-2 text-sm leading-7 text-violet-950/60">
            Review, filter, edit, and delete your latest transactions.
          </p>
        </div>

        <NoPaginationTransactionTable transactions={serializedTransactions} />
      </div>
    </DashboardPageShell>
  );
}
