import { notFound, redirect } from "next/navigation";

import DashboardPageShell from "@/components/dashboard-page-shell";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";

type TransactionCreatePageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export default async function TransactionCreatePage({
  searchParams,
}: TransactionCreatePageProps) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { edit } = await searchParams;

  const [rawAccounts, transactionToEdit] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
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
    <DashboardPageShell
      eyebrow="Transaction"
      title={edit ? "Edit transaction" : "Add transaction"}
      description={
        edit
          ? "Update the transaction details and keep your account balance in sync."
          : "Record income, expenses, categories, and recurring schedules in one focused form."
      }
    >
      <div className="mx-auto w-full max-w-3xl">
        <AddTransactionForm
          accounts={accounts}
          categories={categories}
          editMode={Boolean(edit)}
          initialData={initialData}
        />
      </div>
    </DashboardPageShell>
  );
}
