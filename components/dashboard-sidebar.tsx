"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
} from "lucide-react";
import SidebarBankingSection from "@/components/sidebar-banking-section";

export const dashboardSidebarWidthClass = "lg:w-[250px]";

export const dashboardNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, segment: "" },
  {
    href: "/dashboard/transaction/create",
    label: "Add Transaction",
    icon: CreditCard,
    segment: "/transaction/create",
  },
  { href: "/dashboard/budgets", label: "Budget", icon: PiggyBank, segment: "/budgets" },
  { href: "/dashboard/reports", label: "Reports", icon: ReceiptText, segment: "/reports" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, segment: "/analytics" },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: BrainCircuit, segment: "/ai-insights" },
];

type DashboardSidebarProps = {
  accounts: {
    id: string;
    name: string;
    balance: number;
    isDefault: boolean;
  }[];
  basePath?: string;
  demoMode?: boolean;
};

export default function DashboardSidebar({
  accounts,
  basePath = "/dashboard",
  demoMode = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden h-full shrink-0 border-r border-violet-100 bg-white/92 backdrop-blur-xl lg:flex ${dashboardSidebarWidthClass}`}
    >
      <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
        <nav className="space-y-2">
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
                className={
                  isActive
                    ? "relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-medium text-white shadow-[0_20px_44px_-24px_rgba(109,40,217,0.82)] ring-1 ring-violet-300/40 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-violet-500/30 before:blur-xl"
                    : "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-violet-950/72 transition duration-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-[0_14px_32px_-22px_rgba(109,40,217,0.22)]"
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto min-h-0 space-y-5">
          <SidebarBankingSection accounts={accounts} demoMode={demoMode} />

          <div className="border-t border-violet-100 pt-5">
            <p className="text-xs leading-6 text-violet-950/55">
              {demoMode ? "Demo access is view-only with sample data." : <>Made with <span className="text-violet-600">💜</span> by Debarghya</>}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
