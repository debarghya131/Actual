import {
  Activity,
  CircleDollarSign,
  PiggyBank,
  Repeat2,
  Wallet,
} from "lucide-react";

import { db } from "@/lib/prisma";

export const SCORE_ITEMS = [
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

export type ScoreKey = (typeof SCORE_ITEMS)[number]["key"];

export type FinancialHealthSnapshot = {
  score: number | null;
  isReady: boolean;
  status: {
    label: string;
    className: string;
  };
  scoreParts: Record<ScoreKey, number>;
};

export async function getFinancialHealthSnapshot(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [accounts, transactions, budget] = await Promise.all([
    db.account.findMany({
      where: { userId },
    }),
    db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: {
          gte: startOfMonth,
          lte: now,
        },
      },
      orderBy: { date: "desc" },
    }),
    db.budget.findUnique({
      where: { userId },
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
  const hasMeaningfulActivity = totalIncome > 0 || totalExpenses > 0;
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

  if (!hasMeaningfulActivity) {
    return {
      score: null,
      isReady: false,
      status: getInsufficientDataStatus(),
      scoreParts: {
        savings: 0,
        spending: 0,
        budget: 0,
        recurring: 0,
        balance: 0,
      },
    } satisfies FinancialHealthSnapshot;
  }

  const score = Math.round(
    Object.values(scoreParts).reduce((total, part) => total + part, 0)
  );

  return {
    score,
    isReady: true,
    status: getScoreStatus(score),
    scoreParts,
  } satisfies FinancialHealthSnapshot;
}

export function getMaxScore(key: ScoreKey) {
  const scores: Record<ScoreKey, number> = {
    savings: 30,
    spending: 25,
    budget: 20,
    recurring: 15,
    balance: 10,
  };

  return scores[key];
}

function clampScore(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

function getInsufficientDataStatus() {
  return {
    label: "Insufficient Data",
    className: "text-violet-700",
  };
}
