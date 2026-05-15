"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavItems } from "@/components/dashboard-sidebar";

export default function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-violet-100 bg-white/92 px-4 py-4 lg:hidden">
      <div className="mb-4">
        <p className="text-xs font-semibold tracking-[0.18em] text-violet-500 uppercase">
          Dashboard
        </p>
        <p className="mt-1 text-sm text-violet-950/68">Navigate your finance workspace</p>
      </div>

      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {dashboardNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "rounded-full bg-violet-700 px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
                  : "rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-violet-700 transition hover:border-violet-200 hover:bg-violet-50"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
