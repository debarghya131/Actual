"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { AccountType } from "@/lib/generated/prisma/enums";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

type DecimalLike = {
  toNumber: () => number;
};

type SerializableRecord = Record<string, unknown>;

type CreateAccountInput = {
  name: string;
  type: AccountType;
  balance: string | number;
  isDefault?: boolean;
};

function hasToNumber(value: unknown): value is DecimalLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  );
}

function serializeDecimalFields<T extends SerializableRecord>(record: T) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      hasToNumber(value) ? value.toNumber() : value,
    ]),
  ) as {
    [K in keyof T]: T[K] extends DecimalLike ? number : T[K];
  };
}

async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await checkUser();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getUserAccounts() {
  const user = await getCurrentDbUser();

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  return accounts.map(serializeDecimalFields);
}

export async function createAccount(data: CreateAccountInput) {
  const user = await getCurrentDbUser();

  const name = data.name.trim();
  const balance = Number(data.balance);

  if (!name) {
    throw new Error("Account name is required");
  }

  if (!Number.isFinite(balance)) {
    throw new Error("Invalid balance amount");
  }

  if (!Object.values(AccountType).includes(data.type)) {
    throw new Error("Invalid account type");
  }

  const account = await db.$transaction(async (tx) => {
    const existingAccountCount = await tx.account.count({
      where: { userId: user.id },
    });

    const shouldBeDefault = existingAccountCount === 0 || Boolean(data.isDefault);

    if (shouldBeDefault) {
      await tx.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.account.create({
      data: {
        name,
        type: data.type,
        balance,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    data: serializeDecimalFields(account),
  };
}

export async function getDashboardData() {
  const user = await getCurrentDbUser();

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeDecimalFields);
}
