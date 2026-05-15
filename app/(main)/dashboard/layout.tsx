import type { ReactNode } from "react";

import DashboardMobileNav from "@/components/dashboard-mobile-nav";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full bg-[linear-gradient(180deg,_#fcfaff_0%,_#f6f0ff_100%)]">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <DashboardMobileNav />
        {children}
      </div>
    </div>
  );
}
