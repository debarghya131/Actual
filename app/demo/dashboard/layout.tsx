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
    <div className="flex h-full bg-[linear-gradient(180deg,_#fcfaff_0%,_#f6f0ff_100%)] lg:gap-6">
      <DashboardSidebar accounts={accounts} basePath="/demo/dashboard" demoMode />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <DashboardMobileNav basePath="/demo/dashboard" />
        <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
      </div>
    </div>
  );
}
