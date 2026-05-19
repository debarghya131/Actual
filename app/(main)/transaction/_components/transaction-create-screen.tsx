import { notFound, redirect } from "next/navigation";

import { TransactionTable } from "@/app/(main)/account/_components/transaction-table";
import { defaultCategories } from "@/data/categories";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { TransactionFormDialog } from "./transaction-form-dialog";

type TransactionCreateScreenProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export async function TransactionCreateScreen({
  searchParams,
}: TransactionCreateScreenProps) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { edit } = await searchParams;

  const [rawAccounts, rawTransactions, transactionToEdit] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    edit
      ? db.transaction.findFirst({
          where: {
            id: edit,
            userId: user.id,
          },
        })
      : null,
  ]);

  if (edit && !transactionToEdit) {
    notFound();
  }

  const accounts = rawAccounts.map((account) => ({
    id: account.id,
    name: account.name,
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
    isRecurring: transaction.isRecurring,
    recurringInterval: transaction.recurringInterval,
    nextRecurringDate: transaction.nextRecurringDate?.toISOString() ?? null,
  }));

  const categories = defaultCategories.map((category) => ({
    id: category.id,
    name: category.name,
    type: category.type as "INCOME" | "EXPENSE",
  }));

  const initialData = transactionToEdit
    ? {
        id: transactionToEdit.id,
        type: transactionToEdit.type,
        amount: Number(transactionToEdit.amount),
        description: transactionToEdit.description,
        accountId: transactionToEdit.accountId,
        category: transactionToEdit.category,
        date: transactionToEdit.date.toISOString(),
        isRecurring: transactionToEdit.isRecurring,
        recurringInterval: transactionToEdit.recurringInterval,
      }
    : null;

  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1680px] rounded-[28px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] sm:p-8">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-violet-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Transaction History
              </h2>
              <p className="mt-2 text-sm leading-7 text-violet-950/60">
                Filter by account, type, or recurring status while you review and
                update recent activity.
              </p>
            </div>

            <TransactionFormDialog
              key={edit ?? "new-transaction"}
              accounts={accounts}
              categories={categories}
              editMode={Boolean(edit)}
              initialData={initialData}
            />
          </div>

          <TransactionTable transactions={transactions} accounts={accounts} />
        </section>
      </div>
    </section>
  );
}
