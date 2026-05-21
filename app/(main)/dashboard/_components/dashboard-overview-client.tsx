"use client";

import dynamic from "next/dynamic";

import type { DashboardPreferences } from "@/lib/dashboard-preferences";

const BudgetProgress = dynamic(() => import("./budget-progress"), {
  ssr: false,
  loading: () => (
    <div className="min-h-28 rounded-2xl border border-violet-100/80 bg-white/95 shadow-[0_18px_44px_-32px_rgba(109,40,217,0.26)]" />
  ),
});

const DashboardOverview = dynamic(() => import("./transaction-overview"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[28rem] rounded-2xl border border-violet-100/80 bg-white/95 shadow-[0_20px_46px_-34px_rgba(109,40,217,0.24)]" />
  ),
});

type DashboardOverviewClientProps = {
  budget: {
    id: string;
    amount: number;
  } | null;
  currentExpenses: number;
  accounts: {
    id: string;
    name: string;
    type: "CURRENT" | "SAVINGS";
    balance: number;
    isDefault: boolean;
  }[];
  transactions: {
    id: string;
    accountId: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string | null;
    date: string;
    category: string | null;
  }[];
  preferences: DashboardPreferences;
};

export default function DashboardOverviewClient({
  budget,
  currentExpenses,
  accounts,
  transactions,
  preferences,
}: DashboardOverviewClientProps) {
  return (
    <div className="min-w-0 space-y-5 md:space-y-6">
      <BudgetProgress
        initialBudget={budget}
        currentExpenses={currentExpenses}
      />

      <DashboardOverview
        accounts={accounts}
        transactions={transactions}
        preferences={preferences}
      />
    </div>
  );
}
