import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardShellClient from "@/components/dashboard-shell-client";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const rawAccounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  const accounts = rawAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: Number(account.balance),
    isDefault: account.isDefault,
  }));

  return (
    <DashboardShellClient accounts={accounts}>{children}</DashboardShellClient>
  );
}
