"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import DashboardRouteTransition from "@/components/dashboard-route-transition";

const DashboardSidebar = dynamic(
  () => import("@/components/dashboard-sidebar"),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden w-[250px] shrink-0 border-r border-violet-100 bg-white/92 lg:flex" />
    ),
  },
);

const DashboardMobileNav = dynamic(
  () => import("@/components/dashboard-mobile-nav"),
  {
    ssr: false,
    loading: () => (
      <div className="border-b border-violet-100 bg-white/92 px-3 py-3 min-[380px]:px-4 lg:hidden" />
    ),
  },
);

type DashboardShellClientProps = {
  accounts: {
    id: string;
    name: string;
    balance: number;
    isDefault: boolean;
  }[];
  children: ReactNode;
};

export default function DashboardShellClient({
  accounts,
  children,
}: DashboardShellClientProps) {
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
