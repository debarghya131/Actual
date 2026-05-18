"use client";

import { useState } from "react";
import { CreditCard, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
};

export function TransactionFormDialog({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}: TransactionFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(editMode);

  const closeDialog = () => {
    setOpen(false);
    if (editMode) {
      router.replace("/dashboard/transaction/create");
    }
  };

  return (
    <>
      <Button
        type="button"
        className="h-10 gap-2 rounded-lg bg-slate-950 px-4 text-white hover:bg-slate-900"
        onClick={() => setOpen(true)}
      >
        <CreditCard className="h-4 w-4" />
        Add Transaction
      </Button>

      {open && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          role="dialog"
        >
          <div className="relative w-full max-w-3xl rounded-2xl border border-violet-100 bg-white p-5 shadow-2xl sm:p-6">
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
                onClick={closeDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto pr-1">
              <AddTransactionForm
                accounts={accounts}
                categories={categories}
                editMode={editMode}
                initialData={initialData}
                onCancel={closeDialog}
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
