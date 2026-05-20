"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { CreditCard, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { showDemoModeToast } from "@/lib/demo-mode";
import { AddTransactionForm } from "./transaction-form";

type AccountOption = {
  id: string;
  name: string;
  balance: number | string;
  isDefault?: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type InitialTransaction = {
  id?: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string | null;
  accountId: string;
  category: string;
  date: Date | string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
};

type TransactionFormDialogProps = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  editMode?: boolean;
  initialData?: InitialTransaction | null;
  demoMode?: boolean;
  basePath?: string;
};

export function TransactionFormDialog({
  accounts,
  categories,
  editMode = false,
  initialData = null,
  demoMode = false,
  basePath = "/dashboard",
}: TransactionFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(editMode);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const closeDialog = () => {
    setOpen(false);
    if (editMode) {
      router.replace(`${basePath}/transaction/create`);
    }
  };

  return (
    <>
      <LazyMotion features={domAnimation}>
        <m.div whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}>
          <Button
            type="button"
            className="h-10 gap-2 rounded-xl bg-slate-950 px-4 text-white shadow-[0_16px_34px_-18px_rgba(15,23,42,0.75)] transition duration-300 hover:bg-slate-900 hover:shadow-[0_20px_42px_-18px_rgba(109,40,217,0.55)]"
            onClick={() => {
              if (demoMode) {
                showDemoModeToast("adding a transaction");
                return;
              }
              setOpen(true);
            }}
          >
            <CreditCard className="h-4 w-4" />
            Add Transaction
          </Button>
        </m.div>

        {open && mounted
          ? createPortal(
              <div
                aria-modal="true"
                className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/38 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-8"
                role="dialog"
              >
                <m.div
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="relative my-2 flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-violet-100/90 bg-white p-5 shadow-[0_34px_100px_-38px_rgba(15,23,42,0.45)] sm:my-6 sm:max-h-[calc(100vh-4rem)] sm:p-6"
                >
                  <div className="mb-5 flex items-start justify-between gap-4 border-b border-violet-100 pb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">
                        {editMode ? "Edit Transaction" : "Add Transaction"}
                      </h2>
                      <p className="mt-1 text-sm text-violet-950/60">
                        {editMode
                          ? "Update this record and keep balances in sync."
                          : "Record a new income or expense without leaving history."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Close transaction form"
                      className="rounded-full transition duration-300 hover:bg-violet-50 hover:shadow-[0_12px_28px_-18px_rgba(109,40,217,0.24)]"
                      onClick={closeDialog}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <AddTransactionForm
                      accounts={accounts}
                      categories={categories}
                      editMode={editMode}
                      initialData={initialData}
                      onCancel={closeDialog}
                      onSuccess={() => setOpen(false)}
                      demoMode={demoMode}
                    />
                  </div>
                </m.div>
              </div>,
              document.body
            )
          : null}
      </LazyMotion>
    </>
  );
}
