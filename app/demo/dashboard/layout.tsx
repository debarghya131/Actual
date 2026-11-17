import type { ReactNode } from "react";

import DashboardMobileNav from "@/components/dashboard-mobile-nav";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { demoAccounts } from "@/lib/demo-data";

export default function DemoDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const accounts = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: account.balance,
    isDefault: account.isDefault,
  }));

  return (
    <div className="flex min-h-full bg-[linear-gradient(180deg,_#fcfaff_0%,_#f6f0ff_100%)] lg:h-full lg:gap-6">
      <DashboardSidebar accounts={accounts} basePath="/demo/dashboard" demoMode />
      <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-y-auto modern-scrollbar">
        <DashboardMobileNav
          accounts={accounts}
          basePath="/demo/dashboard"
          demoMode
          showHealthScore
        />
        <div className="mx-auto flex w-full max-w-[104rem] flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-4.5 lg:h-full lg:min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
