import { redirect } from "next/navigation";
import { Activity, CircleDollarSign, PiggyBank, Repeat2, Wallet } from "lucide-react";

import DashboardPageShell from "@/components/dashboard-page-shell";
import { checkUser } from "@/lib/checkUser";
import { formatCurrency } from "@/lib/currency";
import { db } from "@/lib/prisma";

const SCORE_ITEMS = [
  {
    key: "savings",
    label: "Savings ratio",
    description: "Income kept after expenses this month.",
    icon: PiggyBank,
  },
  {
    key: "spending",
    label: "Spending habits",
    description: "How controlled expenses are against income.",
    icon: CircleDollarSign,
  },
  {
    key: "budget",
    label: "Budget discipline",
    description: "Progress against your monthly budget.",
    icon: Activity,
  },
  {
    key: "recurring",
    label: "Recurring debt",
    description: "Recurring expense pressure on income.",
    icon: Repeat2,
  },
  {
    key: "balance",
    label: "Monthly balance",
    description: "Account balance coverage for monthly expenses.",
    icon: Wallet,
  },
] as const;

type ScoreKey = (typeof SCORE_ITEMS)[number]["key"];

export default async function FinancialHealthPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [accounts, transactions, budget] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
    }),
    db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        date: {
          gte: startOfMonth,
          lte: now,
        },
      },
      orderBy: { date: "desc" },
    }),
    db.budget.findUnique({
      where: { userId: user.id },
    }),
  ]);

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0
  );
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const recurringExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "EXPENSE" && transaction.isRecurring
    )
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const net = totalIncome - totalExpenses;
  const budgetAmount = budget ? Number(budget.amount) : null;

  const savingsRatio = totalIncome > 0 ? Math.max(net / totalIncome, 0) : 0;
  const expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  const recurringRatio =
    totalIncome > 0 ? recurringExpenses / totalIncome : recurringExpenses > 0 ? 1 : 0;
  const balanceCoverage =
    totalExpenses > 0 ? totalBalance / totalExpenses : totalBalance > 0 ? 3 : 0;
  const budgetUsage =
    budgetAmount && budgetAmount > 0 ? totalExpenses / budgetAmount : null;

  const scoreParts: Record<ScoreKey, number> = {
    savings: clampScore((savingsRatio / 0.2) * 30, 0, 30),
    spending: clampScore((1 - expenseRatio / 0.9) * 25, 0, 25),
    budget:
      budgetUsage === null
        ? 10
        : clampScore((1 - Math.max(budgetUsage - 0.8, 0) / 0.5) * 20, 0, 20),
    recurring: clampScore((1 - recurringRatio / 0.35) * 15, 0, 15),
    balance: clampScore((balanceCoverage / 3) * 10, 0, 10),
  };

  const score = Math.round(
    Object.values(scoreParts).reduce((total, part) => total + part, 0)
  );
  const status = getScoreStatus(score);

  return (
    <DashboardPageShell
      eyebrow="Financial Health"
      title="Financial Health Score"
      description="A quick wellness score based on your cash flow, budget discipline, recurring expenses, and account balances."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-6">
          <p className="text-sm font-medium text-violet-700">
            Current Score
          </p>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-6xl font-semibold tracking-tight text-slate-950">
              {score}
            </span>
            <span className="pb-2 text-lg font-medium text-violet-950/55">
              /100
            </span>
          </div>
          <p className={`mt-4 text-lg font-semibold ${status.className}`}>
            {status.label}
          </p>
          <p className="mt-3 text-sm leading-7 text-violet-950/65">
            This score updates with your current month activity. Higher income
            retention, lower recurring expenses, and healthier balances improve it.
          </p>

          <div className="mt-6 grid gap-3 text-sm">
            <Metric label="Income" value={formatCurrency(totalIncome)} />
            <Metric label="Expenses" value={formatCurrency(totalExpenses)} />
            <Metric label="Net" value={formatCurrency(net)} />
            <Metric label="Total balance" value={formatCurrency(totalBalance)} />
          </div>
        </section>

        <section className="grid gap-3">
          {SCORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const maxScore = getMaxScore(item.key);
            const partScore = Math.round(scoreParts[item.key]);

            return (
              <div
                key={item.key}
                className="rounded-2xl border border-violet-100 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-950">
                        {item.label}
                      </h2>
                      <p className="mt-1 text-sm text-violet-950/60">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-950">
                    {partScore}/{maxScore}
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-violet-100">
                  <div
                    className="h-full rounded-full bg-violet-700"
                    style={{ width: `${(partScore / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </DashboardPageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
      <span className="text-violet-950/60">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function clampScore(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getMaxScore(key: ScoreKey) {
  const scores: Record<ScoreKey, number> = {
    savings: 30,
    spending: 25,
    budget: 20,
    recurring: 15,
    balance: 10,
  };

  return scores[key];
}

function getScoreStatus(score: number) {
  if (score >= 80) {
    return { label: "Excellent", className: "text-green-600" };
  }

  if (score >= 65) {
    return { label: "Good", className: "text-emerald-600" };
  }

  if (score >= 45) {
    return { label: "Needs Attention", className: "text-amber-600" };
  }

  return { label: "At Risk", className: "text-red-600" };
}
