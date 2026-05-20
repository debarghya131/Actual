"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { dashboardNavItems } from "@/components/dashboard-sidebar";
import FinancialHealthNavScore from "@/components/financial-health-nav-score";
import SidebarBankingSection from "@/components/sidebar-banking-section";

type MobileNavAccount = {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
};

type DashboardMobileNavProps = {
  accounts?: MobileNavAccount[];
  basePath?: string;
  demoMode?: boolean;
  showHealthScore?: boolean;
};

export default function DashboardMobileNav({
  accounts = [],
  basePath = "/dashboard",
  demoMode = false,
  showHealthScore = basePath === "/dashboard",
}: DashboardMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-violet-100 bg-white/92 px-3 py-3 min-[380px]:px-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        {showHealthScore ? (
          <div className="min-w-0">
            <FinancialHealthNavScore />
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          aria-label={open ? "Close dashboard menu" : "Open dashboard menu"}
          aria-expanded={open}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-700 shadow-[0_14px_34px_-24px_rgba(109,40,217,0.45)] transition hover:border-violet-200 hover:bg-violet-50"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="mt-3 max-h-[calc(100vh-9rem)] min-w-0 overflow-y-auto pr-1">
          <nav className="grid min-w-0 gap-2">
            {dashboardNavItems.map((item) => {
              const href = `${basePath}${item.segment}`;
              const isActive =
                item.segment === ""
                  ? pathname === basePath
                  : pathname.startsWith(href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={
                    isActive
                      ? "relative flex min-h-12 min-w-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-medium text-white shadow-[0_16px_36px_-20px_rgba(109,40,217,0.8)] ring-1 ring-violet-300/40"
                      : "flex min-h-12 min-w-0 items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-medium text-violet-700 transition duration-300 hover:border-violet-200 hover:bg-violet-50 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.24)]"
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-violet-100 bg-white/80 px-3 pb-3">
            <SidebarBankingSection accounts={accounts} demoMode={demoMode} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
