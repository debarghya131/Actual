import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/app/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

const RECURRING_INTERVALS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;

type RecurringInterval = (typeof RECURRING_INTERVALS)[number];

type MonthlyStats = {
  totalIncome: number;
  totalExpenses: number;
  byCategory: Record<string, number>;
  transactionCount: number;
};

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
    triggers: [{ event: "transaction.recurring.process" }],
  },
  async ({ event, step }) => {
    const { transactionId, userId } = event.data as {
      transactionId?: string;
      userId?: string;
    };

    if (!transactionId || !userId) {
      return { status: "skipped", reason: "Missing transactionId or userId" };
    }

    return step.run("process-transaction", async () => {
      const transaction = await db.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
          isRecurring: true,
          status: "COMPLETED",
        },
      });

      if (!transaction) {
        return { status: "skipped", reason: "Recurring transaction not found" };
      }

      if (!isRecurringInterval(transaction.recurringInterval)) {
        return {
          status: "skipped",
          reason: "Recurring transaction has no valid interval",
        };
      }

      const recurringInterval = transaction.recurringInterval;

      if (!isTransactionDue(transaction.nextRecurringDate)) {
        return {
          status: "skipped",
          reason: "Recurring transaction is not due yet",
          nextRecurringDate: transaction.nextRecurringDate,
        };
      }

      const processedAt = new Date();
      const balanceChange =
        transaction.type === "EXPENSE"
          ? -Number(transaction.amount)
          : Number(transaction.amount);

      const result = await db.$transaction(async (tx) => {
        const nextRecurringDate = calculateNextRecurringDate(
          processedAt,
          recurringInterval
        );
        const claimResult = await tx.transaction.updateMany({
          where: {
            id: transaction.id,
            userId,
            isRecurring: true,
            status: "COMPLETED",
            recurringInterval,
            nextRecurringDate: transaction.nextRecurringDate,
          },
          data: {
            lastProcessed: processedAt,
            nextRecurringDate,
          },
        });

        // Another worker may have already processed this due item.
        if (claimResult.count === 0) {
          return {
            status: "skipped" as const,
            reason: "Recurring transaction already processed",
          };
        }

        const createdTransaction = await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description
              ? `${transaction.description} (Recurring)`
              : "Recurring transaction",
            date: processedAt,
            category: transaction.category,
            status: "COMPLETED",
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
          },
        });

        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        return {
          createdTransactionId: createdTransaction.id,
          status: "processed" as const,
          nextRecurringDate,
        };
      });

      if (result.status === "skipped") {
        return result;
      }

      return {
        sourceTransactionId: transaction.id,
        ...result,
      };
    });
  }
);

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
    triggers: [{ cron: "0 0 * * *" }],
  },
  async ({ step }) => {
    const dueTransactions = await step.run(
      "fetch-due-recurring-transactions",
      async () => {
        return db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            recurringInterval: {
              in: [...RECURRING_INTERVALS],
            },
            OR: [
              { nextRecurringDate: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
          select: {
            id: true,
            userId: true,
          },
        });
      }
    );

    if (dueTransactions.length > 0) {
      await step.sendEvent(
        "send-recurring-transaction-events",
        dueTransactions.map((transaction) => ({
          name: "transaction.recurring.process",
          data: {
            transactionId: transaction.id,
            userId: transaction.userId,
          },
        }))
      );
    }

    return { triggered: dueTransactions.length };
  }
);

export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return db.budget.findMany({
        include: {
          user: true,
        },
      });
    });

    const results = [];

    for (const budget of budgets) {
      const result = await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            type: "EXPENSE",
            status: "COMPLETED",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = Number(expenses._sum.amount || 0);
        const budgetAmount = Number(budget.amount);

        if (budgetAmount <= 0) {
          return {
            budgetId: budget.id,
            status: "skipped",
            reason: "Budget amount is zero or less",
          };
        }

        const percentageUsed = (totalExpenses / budgetAmount) * 100;
        const alreadyAlertedThisMonth =
          budget.lastAlertSent &&
          !isNewMonth(new Date(budget.lastAlertSent), new Date());

        if (percentageUsed < 80) {
          return {
            budgetId: budget.id,
            status: "skipped",
            reason: "Budget usage is below 80%",
            percentageUsed: Number(percentageUsed.toFixed(1)),
            budgetAmount: Number(budgetAmount.toFixed(1)),
            totalExpenses: Number(totalExpenses.toFixed(1)),
          };
        }

        if (alreadyAlertedThisMonth) {
          return {
            budgetId: budget.id,
            status: "skipped",
            reason: "Budget alert already sent this month",
            lastAlertSent: budget.lastAlertSent,
            percentageUsed: Number(percentageUsed.toFixed(1)),
            budgetAmount: Number(budgetAmount.toFixed(1)),
            totalExpenses: Number(totalExpenses.toFixed(1)),
          };
        }

        const emailResult = await sendEmail({
          to: budget.user.email,
          subject: "Budget Alert",
          react: EmailTemplate({
            userName: budget.user.name,
            type: "budget-alert",
            data: {
              percentageUsed,
              budgetAmount: Number(budgetAmount.toFixed(1)),
              totalExpenses: Number(totalExpenses.toFixed(1)),
            },
          }),
        });

        if (!emailResult.success) {
          return {
            budgetId: budget.id,
            status: "failed",
            reason: getErrorMessage(emailResult.error),
            userId: budget.userId,
            email: budget.user.email,
            percentageUsed: Number(percentageUsed.toFixed(1)),
            budgetAmount: Number(budgetAmount.toFixed(1)),
            totalExpenses: Number(totalExpenses.toFixed(1)),
          };
        }

        await db.budget.update({
          where: { id: budget.id },
          data: { lastAlertSent: new Date() },
        });

        return {
          budgetId: budget.id,
          status: "sent",
          userId: budget.userId,
          email: budget.user.email,
          emailId: emailResult.data?.id,
          percentageUsed: Number(percentageUsed.toFixed(1)),
          budgetAmount: Number(budgetAmount.toFixed(1)),
          totalExpenses: Number(totalExpenses.toFixed(1)),
        };
      });

      results.push(result);
    }

    return {
      checked: budgets.length,
      results,
    };
  }
);

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
    triggers: [{ cron: "0 0 1 * *" }],
  },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        include: {
          accounts: true,
        },
      });
    });

    const { startDate, endDate } = getPreviousMonthRange();
    const month = startDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const reports = [];

    for (const user of users) {
      const report = await step.run(`generate-report-${user.id}`, async () => {
        const stats = await getMonthlyStats(user.id, startDate, endDate);
        const insights = await generateFinancialInsights(stats, month);
        const totalBalance = user.accounts.reduce(
          (total, account) => total + Number(account.balance),
          0
        );

        const emailResult = await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${month}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month,
              insights,
              accountCount: user.accounts.length,
              totalBalance: Number(totalBalance.toFixed(2)),
            },
          }),
        });

        if (!emailResult.success) {
          return {
            userId: user.id,
            email: user.email,
            month,
            status: "failed",
            reason: getErrorMessage(emailResult.error),
            stats,
          };
        }

        return {
          userId: user.id,
          email: user.email,
          month,
          status: "sent",
          emailId: emailResult.data?.id,
          stats,
          insights,
        };
      });

      reports.push(report);
    }

    return {
      generated: reports.length,
      period: {
        startDate,
        endDate,
      },
      reports,
    };
  }
);

async function generateFinancialInsights(stats: MonthlyStats, month: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackInsights();
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: INR ${stats.totalIncome}
    - Total Expenses: INR ${stats.totalExpenses}
    - Net Income: INR ${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: INR ${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    if (
      Array.isArray(parsed) &&
      parsed.every((insight) => typeof insight === "string")
    ) {
      return parsed.slice(0, 3);
    }

    return getFallbackInsights();
  } catch (error) {
    console.error("Error generating monthly report insights:", error);
    return getFallbackInsights();
  }
}

function getFallbackInsights() {
  return [
    "Review your highest spending category and look for one small cut next month.",
    "Keep your recurring expenses visible so subscriptions do not quietly grow.",
    "Compare income and expenses monthly to keep your savings goal on track.",
  ];
}

async function getMonthlyStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<MonthlyStats> {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      status: "COMPLETED",
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  return transactions.reduce<MonthlyStats>(
    (stats, transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[transaction.category] =
          (stats.byCategory[transaction.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }

      stats.totalIncome = Number(stats.totalIncome.toFixed(2));
      stats.totalExpenses = Number(stats.totalExpenses.toFixed(2));

      return stats;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

function isTransactionDue(nextRecurringDate: Date | null) {
  return !nextRecurringDate || nextRecurringDate <= new Date();
}

function isRecurringInterval(value: unknown): value is RecurringInterval {
  return (
    typeof value === "string" &&
    (RECURRING_INTERVALS as readonly string[]).includes(value)
  );
}

function calculateNextRecurringDate(date: Date, interval: RecurringInterval) {
  const next = new Date(date);

  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

function getPreviousMonthRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}
