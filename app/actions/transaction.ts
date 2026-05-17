"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { Prisma } from "@/lib/generated/prisma/client";

type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type TransactionType = "INCOME" | "EXPENSE";

type TransactionInput = {
  type: TransactionType;
  amount: number;
  description?: string;
  date: Date;
  accountId: string;
  category: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
};

type DecimalAmount = {
  toNumber: () => number;
};

type AmountRecord = {
  amount: DecimalAmount;
};

type ReceiptScanResult = Partial<{
  amount: number | string;
  date: string;
  description: string;
  merchantName: string;
  category: string;
}>;

const serializeAmount = <T extends AmountRecord>(obj: T) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

function normalizeTransactionInput(data: TransactionInput) {
  if (data.isRecurring && !data.recurringInterval) {
    throw new Error("Recurring interval is required");
  }

  return {
    ...data,
    recurringInterval: data.isRecurring ? data.recurringInterval : null,
    nextRecurringDate:
      data.isRecurring && data.recurringInterval
        ? calculateNextRecurringDate(data.date, data.recurringInterval)
        : null,
  };
}

// Create Transaction
export async function createTransaction(data: TransactionInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const transactionData = normalizeTransactionInput(data);

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...transactionData,
          userId: user.id,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getTransaction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id: string, data: TransactionInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;
    const transactionData = normalizeTransactionInput(data);

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...transactionData,
        },
      });

      if (originalTransaction.accountId === data.accountId) {
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: netBalanceChange,
            },
          },
        });
      } else {
        await tx.account.update({
          where: { id: originalTransaction.accountId },
          data: {
            balance: {
              decrement: oldBalanceChange,
            },
          },
        });

        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: newBalanceChange,
            },
          },
        });
      }

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
    revalidatePath(`/account/${data.accountId}`);
    if (originalTransaction.accountId !== data.accountId) {
      revalidatePath(`/account/${originalTransaction.accountId}`);
    }

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Get User Transactions
export async function getUserTransactions(
  query: Prisma.TransactionWhereInput = {}
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Scan Receipt
export async function scanReceipt(file: File) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set.");
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:${file.type};base64,${base64String}`;

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:
          process.env.GROQ_MODEL ||
          "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
        max_completion_tokens: 1024,
      }),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        getGroqErrorMessage(responseBody) ||
          `Groq request failed with status ${response.status}`
      );
    }

    const text = responseBody?.choices?.[0]?.message?.content;

    if (typeof text !== "string") {
      throw new Error("Groq returned an empty receipt scan response.");
    }

    try {
      const data = JSON.parse(text) as ReceiptScanResult;
      return {
        amount: Number(data.amount ?? 0),
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Groq");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error(`Failed to scan receipt: ${getErrorMessage(error)}`);
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate: Date, interval: RecurringInterval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function getGroqErrorMessage(responseBody: unknown) {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "error" in responseBody
  ) {
    const error = responseBody.error;

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
  }

  return null;
}
