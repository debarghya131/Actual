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

export const dashboardSidebarWidthClass = "lg:w-[280px]";

export const dashboardNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transaction/create", label: "Add Transaction", icon: CreditCard },
  { href: "/dashboard/budgets", label: "Budget", icon: PiggyBank },
  { href: "/dashboard/reports", label: "Reports", icon: ReceiptText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: BrainCircuit },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden h-full shrink-0 border-r border-violet-100 bg-white/92 backdrop-blur-xl lg:flex ${dashboardSidebarWidthClass}`}
    >
      <div className="flex flex-1 flex-col px-5 py-6">
        <nav className="space-y-2">
          {dashboardNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "flex items-center gap-3 rounded-2xl bg-violet-700 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_-24px_rgba(109,40,217,0.8)]"
                    : "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-violet-950/72 transition hover:bg-violet-50 hover:text-violet-900"
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-violet-100 pt-5">
          <p className="text-xs leading-6 text-violet-950/55">
            Made with <span className="text-violet-600">💜</span> by Debarghya
          </p>
        </div>
      </div>
    </aside>
  );
}
