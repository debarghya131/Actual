import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/app/actions/send-email";
import EmailTemplate from "@/emails/templet";

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts",
    triggers: [{ cron: "0 */6 * * *" }], // Every 6 hours
  },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    const results = [];

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) {
        results.push({
          budgetId: budget.id,
          status: "skipped",
          reason: "No default account found",
        });
        continue;
      }

      const result = await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1); // Start of current month
        startDate.setHours(0, 0, 0, 0);

        // Calculate total expenses for the default account only
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id, // Only consider default account
            type: "EXPENSE",
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

        // Check if we should send an alert
        const emailResult = await sendEmail({
          to: budget.user.email,
          subject: `Budget Alert for ${defaultAccount.name}`,
          react: EmailTemplate({
            userName: budget.user.name,
            data: {
              percentageUsed,
              budgetAmount: Number(budgetAmount.toFixed(1)),
              totalExpenses: Number(totalExpenses.toFixed(1)),
              accountName: defaultAccount.name,
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
            accountName: defaultAccount.name,
            percentageUsed: Number(percentageUsed.toFixed(1)),
            budgetAmount: Number(budgetAmount.toFixed(1)),
            totalExpenses: Number(totalExpenses.toFixed(1)),
          };
        }

        // Update last alert sent
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
          accountName: defaultAccount.name,
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

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
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
