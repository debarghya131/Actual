import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardMobileNav from "@/components/dashboard-mobile-nav";
import DashboardSidebar from "@/components/dashboard-sidebar";
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
    <div className="flex h-full bg-[linear-gradient(180deg,_#fcfaff_0%,_#f6f0ff_100%)] lg:gap-6">
      <DashboardSidebar accounts={accounts} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <DashboardMobileNav />
        <div className="px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
