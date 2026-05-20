"use client";

import type { MouseEvent } from "react";
import { useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
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
    <m.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`min-w-0 rounded-2xl border px-3 py-3 transition duration-300 ${
        isDefault
          ? "border-violet-200 bg-[linear-gradient(180deg,_rgba(245,243,255,0.98)_0%,_rgba(238,242,255,0.92)_100%)] shadow-[0_18px_38px_-28px_rgba(109,40,217,0.28)] hover:shadow-[0_22px_44px_-26px_rgba(109,40,217,0.36)]"
          : "border-violet-100 bg-violet-50/55 hover:border-violet-200 hover:bg-violet-50/80 hover:shadow-[0_18px_34px_-28px_rgba(109,40,217,0.22)]"
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950" title={name}>
            {name}
          </p>
          <p className="mt-1 break-words text-base font-semibold leading-snug text-slate-950">
            {formatCurrency(balance)}
          </p>
        </div>
        <Switch
          className="shrink-0"
          checked={isDefault}
          onClick={handleDefaultChange}
          disabled={updateDefaultLoading}
        />
      </div>
      <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-violet-950/60">
        <Wallet className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 truncate">
          {isDefault ? "Default account" : "Available account"}
        </span>
      </div>
    </m.div>
  );
}

export default function SidebarBankingSection({
  accounts,
  demoMode = false,
}: SidebarBankingSectionProps) {
  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-0 min-w-0 border-t border-violet-100 pt-5">
      <div className="mb-3 flex min-w-0 items-center gap-2 px-1">
        <Landmark className="h-4 w-4 shrink-0 text-violet-700" />
        <h3 className="min-w-0 truncate text-xs font-semibold tracking-[0.16em] text-violet-700 uppercase">
          Banking
        </h3>
      </div>

      <div className="min-w-0 space-y-3">
        <m.button
          type="button"
          onClick={() => toast.error("Features coming soon")}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-[linear-gradient(135deg,_rgba(245,243,255,0.98),_rgba(237,233,254,0.9))] px-3 py-3 text-sm font-medium text-violet-700 shadow-[0_16px_36px_-28px_rgba(109,40,217,0.22)] transition duration-300 hover:border-violet-300 hover:shadow-[0_24px_44px_-24px_rgba(109,40,217,0.32)]"
        >
          <Link2 className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words leading-5">Connect Bank API</span>
        </m.button>

        {demoMode ? (
          <m.button
            type="button"
            onClick={() => showDemoModeToast("adding a new account")}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-white px-3 py-3 text-sm font-medium text-violet-500 transition duration-300 hover:border-violet-300 hover:bg-violet-50/80 hover:text-violet-700 hover:shadow-[0_18px_36px_-28px_rgba(109,40,217,0.24)]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words leading-5">Add New Account</span>
          </m.button>
        ) : (
          <CreateAccountDrawer>
            <m.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-white px-3 py-3 text-sm font-medium text-violet-700 transition duration-300 hover:border-violet-300 hover:bg-violet-50 hover:shadow-[0_18px_36px_-28px_rgba(109,40,217,0.24)]"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words leading-5">Add New Account</span>
            </m.button>
          </CreateAccountDrawer>
        )}

        <m.div
          className="max-h-[min(16rem,32vh)] min-w-0 space-y-3 overflow-y-auto pr-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
        >
          {accounts.map((account) => (
            <m.div
              key={account.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <BankingItem account={account} demoMode={demoMode} />
            </m.div>
          ))}
        </m.div>
      </div>
    </div>
    </LazyMotion>
  );
}
