"use client";

import type { MouseEvent } from "react";
import { useEffect } from "react";
import { Landmark, Link2, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";

import CreateAccountDrawer from "@/components/create-account-drawer";
import { Switch } from "@/components/ui/switch";
import { updateDefaultAccount } from "@/app/actions/account";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/currency";
import { showDemoModeToast } from "@/lib/demo-mode";

type BankingAccount = {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
};

type SidebarBankingSectionProps = {
  accounts: BankingAccount[];
  demoMode?: boolean;
};

function BankingItem({
  account,
  demoMode = false,
}: {
  account: BankingAccount;
  demoMode?: boolean;
}) {
  const { id, name, balance, isDefault } = account;
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (demoMode) {
      showDemoModeToast("changing the default account");
      return;
    }

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    try {
      await updateDefaultFn(id);
    } catch {
      toast.error("Failed to update default account");
    }
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/55 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950">{name}</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {formatCurrency(balance)}
          </p>
        </div>
        <Switch
          checked={isDefault}
          onClick={handleDefaultChange}
          disabled={updateDefaultLoading}
        />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-violet-950/60">
        <Wallet className="h-3.5 w-3.5" />
        <span>{isDefault ? "Default account" : "Available account"}</span>
      </div>
    </div>
  );
}

export default function SidebarBankingSection({
  accounts,
  demoMode = false,
}: SidebarBankingSectionProps) {
  return (
    <div className="min-h-0 border-t border-violet-100 pt-5">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Landmark className="h-4 w-4 text-violet-700" />
        <h3 className="text-xs font-semibold tracking-[0.16em] text-violet-700 uppercase">
          Banking
        </h3>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toast.error("Features coming soon")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-100/70"
        >
          <Link2 className="h-4 w-4" />
          <span>Connect Bank API</span>
        </button>

        {demoMode ? (
          <button
            type="button"
            onClick={() => showDemoModeToast("adding a new account")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-white px-4 py-3 text-sm font-medium text-violet-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Account</span>
          </button>
        ) : (
          <CreateAccountDrawer>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-white px-4 py-3 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Account</span>
            </button>
          </CreateAccountDrawer>
        )}

        <div className="max-h-[240px] space-y-3 overflow-y-auto pr-1">
          {accounts.map((account) => (
            <BankingItem key={account.id} account={account} demoMode={demoMode} />
          ))}
        </div>
      </div>
    </div>
  );
}
