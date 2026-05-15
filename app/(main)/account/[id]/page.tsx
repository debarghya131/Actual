import { notFound, redirect } from "next/navigation";

import DashboardPageShell from "@/components/dashboard-page-shell";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCurrency(value: unknown) {
  return currencyFormatter.format(Number(value ?? 0));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const account = await db.account.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 12,
      },
    },
  });

  if (!account) {
    notFound();
  }

  const income = account.transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expenses = account.transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return (
    <DashboardPageShell
      eyebrow="Account"
      title={account.name}
      description="Review this account's current balance, recent transactions, and cash movement."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Balance", formatCurrency(account.balance)],
          ["Recent Income", formatCurrency(income)],
          ["Recent Expenses", formatCurrency(expenses)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-violet-100 bg-white p-5">
            <p className="text-sm font-medium text-violet-950/60">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">Recent Transactions</h2>
        <div className="mt-5 divide-y divide-violet-100">
          {account.transactions.length > 0 ? (
            account.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950">
                    {transaction.description || transaction.category}
                  </p>
                  <p className="mt-1 text-sm text-violet-950/55">
                    {transaction.category} &middot; {dateFormatter.format(transaction.date)}
                  </p>
                </div>
                <p
                  className={
                    transaction.type === "INCOME"
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-slate-950"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-violet-200 bg-violet-50/45 p-4 text-sm leading-6 text-violet-950/62">
              No transactions have been added to this account yet.
            </p>
          )}
        </div>
      </section>
    </DashboardPageShell>
  );
}
