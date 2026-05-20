import { notFound, redirect } from "next/navigation";

import { TransactionTable } from "@/app/(main)/account/_components/transaction-table";
import { defaultCategories } from "@/data/categories";
import { checkUser } from "@/lib/checkUser";
import { formatCurrency } from "@/lib/currency";
import { db } from "@/lib/prisma";
import { TransactionFormDialog } from "./transaction-form-dialog";

type TransactionCreateScreenProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

type WeeklyInsight = {
  title: string;
  value: string;
  copy: string;
} | null;

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

  const weeklyInsight = buildWeeklyInsight(transactions);

  return (
    <section className="min-h-full w-full px-4 pb-8 pt-0 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1680px] rounded-[28px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] backdrop-blur-xl sm:p-8">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-violet-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Transaction History
              </h2>
            </div>

            <TransactionFormDialog
              key={edit ?? "new-transaction"}
              accounts={accounts}
              categories={categories}
              editMode={Boolean(edit)}
              initialData={initialData}
            />
          </div>

          {weeklyInsight ? (
            <div className="relative overflow-hidden rounded-[22px] border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-violet-50 px-4 py-3 shadow-[0_18px_40px_-26px_rgba(16,185,129,0.38)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-10 w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[weeklyInsightSweep_2.4s_linear_infinite]"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {weeklyInsight.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{weeklyInsight.copy}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-lg font-semibold tracking-tight text-emerald-700 shadow-[0_12px_30px_-20px_rgba(16,185,129,0.65)] ring-1 ring-emerald-200">
                  {weeklyInsight.value}
                </span>
              </div>
            </div>
          ) : null}

          <TransactionTable transactions={transactions} accounts={accounts} />
        </section>
      </div>
    </section>
  );
}

function buildWeeklyInsight(
  transactions: Array<{
    type: "INCOME" | "EXPENSE";
    amount: number;
    date: string;
  }>,
): WeeklyInsight {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeek = transactions.filter((transaction) => {
    const time = new Date(transaction.date).getTime();
    return time >= now - oneWeek && time <= now;
  });
  const previousWeek = transactions.filter((transaction) => {
    const time = new Date(transaction.date).getTime();
    return time >= now - oneWeek * 2 && time < now - oneWeek;
  });

  const currentIncome = sumByType(currentWeek, "INCOME");
  const previousIncome = sumByType(previousWeek, "INCOME");
  const currentExpenses = sumByType(currentWeek, "EXPENSE");
  const previousExpenses = sumByType(previousWeek, "EXPENSE");

  const incomeIncrease = getPositiveIncreasePercent(currentIncome, previousIncome);
  const expenseReduction = getPositiveReductionPercent(currentExpenses, previousExpenses);

  if (incomeIncrease <= 0 && expenseReduction <= 0) {
    return null;
  }

  if (incomeIncrease >= expenseReduction) {
    return {
      title: "Best stat of week",
      value: `+${incomeIncrease.toFixed(1)}%`,
      copy: `Income grew by ${formatCurrency(currentIncome - previousIncome)} versus the previous 7-day window.`,
    };
  }

  return {
    title: "Best stat of week",
    value: `+${expenseReduction.toFixed(1)}%`,
    copy: `Expenses were controlled by ${formatCurrency(previousExpenses - currentExpenses)} compared with the previous week.`,
  };
}

function sumByType(
  transactions: Array<{ type: "INCOME" | "EXPENSE"; amount: number }>,
  type: "INCOME" | "EXPENSE",
) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function getPositiveIncreasePercent(current: number, previous: number) {
  if (previous <= 0 || current <= previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

function getPositiveReductionPercent(current: number, previous: number) {
  if (previous <= 0 || current >= previous) {
    return 0;
  }

  return ((previous - current) / previous) * 100;
}
