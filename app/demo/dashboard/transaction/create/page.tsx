import { TransactionTable } from "@/app/(main)/account/_components/transaction-table";
import { TransactionFormDialog } from "@/app/(main)/transaction/_components/transaction-form-dialog";
import { demoAccounts, demoCategories, demoTransactions } from "@/lib/demo-data";

export default function DemoTransactionCreatePage() {
  const accounts = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: account.balance,
    isDefault: account.isDefault,
  }));

  return (
    <section className="min-h-full w-full py-4 sm:py-6">
      <div className="mx-auto w-full max-w-[1680px] rounded-2xl border border-violet-100/90 bg-white/92 p-4 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] sm:rounded-[28px] sm:p-8">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-violet-100 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-950">
                Transaction History
              </h2>
              <p className="mt-2 text-sm leading-7 text-violet-950/60">
                Preview account activity with filters and sample transactions. Editing is disabled in demo mode.
              </p>
            </div>

            <TransactionFormDialog
              accounts={accounts}
              categories={demoCategories}
              demoMode
              basePath="/demo/dashboard"
            />
          </div>

          <TransactionTable
            transactions={demoTransactions}
            accounts={accounts}
            demoMode
            basePath="/demo/dashboard"
          />
        </section>
      </div>
    </section>
  );
}
