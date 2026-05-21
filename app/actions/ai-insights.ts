"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { endOfMonth, format, startOfMonth, subDays } from "date-fns";

import { defaultCategories } from "@/data/categories";
import { enforceRateLimit } from "@/lib/arcjet";
import { db } from "@/lib/prisma";

type KuberaChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type FinanceSnapshot = {
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthNet: number;
  recentIncome: number;
  recentExpenses: number;
  recentNet: number;
  totalBalance: number;
  topExpenseCategories: Array<{ category: string; amount: number }>;
  topIncomeCategories: Array<{ category: string; amount: number }>;
};

const categoryNameById = defaultCategories.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id] = category.name;
    return acc;
  },
  {}
);

function toCategoryLabel(categoryId: string | null | undefined) {
  const normalized = (categoryId ?? "").trim().toLowerCase();

  if (!normalized) {
    return "Uncategorized";
  }

  return categoryNameById[normalized] ?? normalized
    .replace(/-/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCategorySummary(items: Array<{ category: string; amount: number }>) {
  if (items.length === 0) {
    return "None";
  }

  return items
    .map((item) => `${item.category}: INR ${item.amount.toFixed(2)}`)
    .join(", ");
}

function getFallbackKuberaReply(message: string, snapshot: FinanceSnapshot) {
  const lowerMessage = message.toLowerCase();
  const highestExpense = snapshot.topExpenseCategories[0];

  if (lowerMessage.includes("save")) {
    return `Your recent net cash flow is INR ${snapshot.recentNet.toFixed(
      2
    )}. To strengthen savings, protect your monthly surplus first and review ${
      highestExpense?.category ?? "your top expense categories"
    } for the easiest reduction opportunity.`;
  }

  if (
    lowerMessage.includes("overspend") ||
    lowerMessage.includes("expense") ||
    lowerMessage.includes("spend")
  ) {
    return highestExpense
      ? `${highestExpense.category} is your highest recent expense category at INR ${highestExpense.amount.toFixed(
          2
        )}. Start there if you want the fastest spending improvement.`
      : `Your recent expenses total INR ${snapshot.recentExpenses.toFixed(
          2
        )}. I can help you break down where that money is going.`;
  }

  if (lowerMessage.includes("budget")) {
    return `Your current month net is INR ${snapshot.currentMonthNet.toFixed(
      2
    )}. A practical budget move is to cap ${
      highestExpense?.category ?? "your largest expense area"
    } first, then protect a fixed savings amount before other discretionary spending.`;
  }

  return `You currently have INR ${snapshot.totalBalance.toFixed(
    2
  )} across accounts and a recent net cash flow of INR ${snapshot.recentNet.toFixed(
    2
  )}. Ask me about spending, savings, budget planning, or category-wise analysis and I will guide you.`;
}

async function getFinanceSnapshot(userId: string): Promise<FinanceSnapshot> {
  const now = new Date();
  const recentStart = subDays(now, 90);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [accounts, recentTransactions, currentMonthTransactions] = await Promise.all([
    db.account.findMany({
      where: { userId },
    }),
    db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: {
          gte: recentStart,
          lte: now,
        },
      },
      orderBy: { date: "desc" },
    }),
    db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
  ]);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance),
    0
  );

  const recentIncome = recentTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const recentExpenses = recentTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const currentMonthIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const currentMonthExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const byTypeAndCategory = recentTransactions.reduce(
    (acc, transaction) => {
      const key = toCategoryLabel(transaction.category);
      const amount = Number(transaction.amount);

      acc[transaction.type][key] = (acc[transaction.type][key] ?? 0) + amount;
      return acc;
    },
    {
      INCOME: {} as Record<string, number>,
      EXPENSE: {} as Record<string, number>,
    }
  );

  const topExpenseCategories = Object.entries(byTypeAndCategory.EXPENSE)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const topIncomeCategories = Object.entries(byTypeAndCategory.INCOME)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    currentMonthIncome,
    currentMonthExpenses,
    currentMonthNet: currentMonthIncome - currentMonthExpenses,
    recentIncome,
    recentExpenses,
    recentNet: recentIncome - recentExpenses,
    totalBalance,
    topExpenseCategories,
    topIncomeCategories,
  };
}

export async function chatWithKubera({
  message,
  history,
}: {
  message: string;
  history: KuberaChatMessage[];
}) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Please enter a message.");
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  await enforceRateLimit("chatWithKubera", clerkUserId);

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const snapshot = await getFinanceSnapshot(user.id);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      reply: getFallbackKuberaReply(trimmedMessage, snapshot),
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  });

  const monthLabel = format(new Date(), "MMMM yyyy");
  const recentConversation = history
    .slice(-6)
    .map((entry) =>
      `${entry.role === "user" ? "User" : "Kubera"}: ${entry.content}`
    )
    .join("\n");

  const prompt = `
You are Kubera, a calm personal finance guide inside a finance dashboard.
Stay focused on savings, budgeting, cash flow, categories, and financial decisions.
Do not drift into unrelated life coaching topics.
Use simple language, mention INR, and keep the response under 140 words.
If helpful, use at most 3 short bullet points.

Current user financial snapshot:
- Current month: ${monthLabel}
- Current month income: INR ${snapshot.currentMonthIncome.toFixed(2)}
- Current month expenses: INR ${snapshot.currentMonthExpenses.toFixed(2)}
- Current month net: INR ${snapshot.currentMonthNet.toFixed(2)}
- Last 90 days income: INR ${snapshot.recentIncome.toFixed(2)}
- Last 90 days expenses: INR ${snapshot.recentExpenses.toFixed(2)}
- Last 90 days net: INR ${snapshot.recentNet.toFixed(2)}
- Total account balance: INR ${snapshot.totalBalance.toFixed(2)}
- Top expense categories: ${formatCategorySummary(snapshot.topExpenseCategories)}
- Top income categories: ${formatCategorySummary(snapshot.topIncomeCategories)}

Recent conversation:
${recentConversation || "No previous messages."}

Latest user message:
${trimmedMessage}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return {
      reply: text || getFallbackKuberaReply(trimmedMessage, snapshot),
    };
  } catch (error) {
    console.error("Kubera chat failed:", error);

    return {
      reply: getFallbackKuberaReply(trimmedMessage, snapshot),
    };
  }
}
