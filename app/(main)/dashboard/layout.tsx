import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardMobileNav from "@/components/dashboard-mobile-nav";
import DashboardRouteTransition from "@/components/dashboard-route-transition";
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
    <div className="flex min-h-full bg-[linear-gradient(180deg,_#fcfaff_0%,_#f6f0ff_100%)] lg:h-full lg:gap-6">
      <DashboardSidebar accounts={accounts} />
      <div className="min-w-0 flex-1 lg:overflow-y-auto">
        <DashboardMobileNav accounts={accounts} />
        <div className="mx-auto w-full max-w-[104rem] px-3 py-4 min-[380px]:px-4 md:px-6 md:py-6">
          <DashboardRouteTransition>{children}</DashboardRouteTransition>
        </div>
      </div>
    </div>
  );
}
