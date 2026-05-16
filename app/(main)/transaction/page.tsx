import DashboardPageShell from "@/components/dashboard-page-shell";

export default function TransactionPage() {
  return (
    <DashboardPageShell
      eyebrow="Transactions"
      title="Capture and review money movement"
      description="Add new transactions, monitor recent activity, and keep your records organized without leaving the dashboard."
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Quick Entry</h2>
          <p className="mt-3 text-sm leading-7 text-violet-950/65">
            This area is ready for your transaction form, account selector, category picker, and recurring controls.
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
          <p className="mt-3 text-sm leading-7 text-violet-950/60">
            This section is ready for transaction history, filters, and search across your latest entries.
          </p>
        </div>
      </div>
    </DashboardPageShell>
  );
}
