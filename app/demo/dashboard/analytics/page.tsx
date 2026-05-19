import { AccountChart } from "@/app/(main)/account/_components/account-chart";
import { demoAccounts, demoTransactions } from "@/lib/demo-data";

export default function DemoAnalyticsPage() {
  const accounts = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));

  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <AccountChart accounts={accounts} transactions={demoTransactions} />
      </div>
    </section>
  );
}
