import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Plus, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

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

export default async function DashboardPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [accounts, recentTransactions, transactionTotals, budget] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      take: 4,
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      include: { account: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
    db.transaction.groupBy({
      by: ["type"],
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    db.budget.findUnique({
      where: { userId: user.id },
    }),
  ]);

  const balance = accounts.reduce((total, account) => total + Number(account.balance), 0);
  const income =
    transactionTotals.find((total) => total.type === "INCOME")?._sum.amount ?? 0;
  const expenses =
    transactionTotals.find((total) => total.type === "EXPENSE")?._sum.amount ?? 0;
  const budgetAmount = Number(budget?.amount ?? 0);
  const budgetUsed = budgetAmount > 0 ? Math.min((Number(expenses) / budgetAmount) * 100, 100) : 0;

  return (
    <DashboardPageShell
      eyebrow="Overview"
      title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
      description="Your live finance workspace is connected to your saved accounts, budget, and transaction history."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Balance", value: formatCurrency(balance), icon: Wallet },
          { label: "Income", value: formatCurrency(income), icon: ArrowDownLeft },
          { label: "Expenses", value: formatCurrency(expenses), icon: ArrowUpRight },
          { label: "Accounts", value: accounts.length.toString(), icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-2xl border border-violet-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-violet-950/60">{item.label}</p>
                <Icon className="h-4 w-4 text-violet-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <section className="rounded-2xl border border-violet-100 bg-violet-50/45 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">Accounts</h2>
            <Link
              href="/dashboard/transactions"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Add
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <Link
                  key={account.id}
                  href={`/dashboard/account/${account.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-violet-100 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <div>
                    <p className="font-medium text-slate-950">{account.name}</p>
                    <p className="mt-1 text-xs font-medium tracking-[0.16em] text-violet-600 uppercase">
                      {account.type.toLowerCase()}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-950">{formatCurrency(account.balance)}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-violet-200 bg-white p-4 text-sm leading-6 text-violet-950/62">
                No accounts yet. Create an account to start building your dashboard.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-violet-100 bg-white p-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-950">Monthly Budget</span>
              <span className="text-violet-950/64">
                {budgetAmount > 0 ? `${Math.round(budgetUsed)}% used` : "Not set"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
              <div className="h-full rounded-full bg-violet-700" style={{ width: `${budgetUsed}%` }} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-100 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">Recent Transactions</h2>
            <Link
              href="/dashboard/transactions"
              className="text-sm font-medium text-violet-700 transition hover:text-violet-900"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 divide-y divide-violet-100">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {transaction.description || transaction.category}
                    </p>
                    <p className="mt-1 text-sm text-violet-950/55">
                      {transaction.account.name} &middot; {dateFormatter.format(transaction.date)}
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
                No transactions yet. Your latest activity will appear here once you add entries.
              </p>
            )}
          </div>
        </section>
      </div>
    </DashboardPageShell>
  );
}
