import { AccountChart } from "@/app/(main)/account/_components/account-chart";
import {
  demoAccounts,
  DEMO_REFERENCE_DATE,
  getDemoTransactions,
} from "@/lib/demo-data";

export default function DemoAnalyticsPage() {
  const demoTransactions = getDemoTransactions();
  const accounts = demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));

  return (
    <div className="flex h-full min-h-full w-full flex-1 flex-col min-w-0 lg:min-h-0 overflow-x-hidden px-3 py-4 min-[420px]:px-4 sm:px-5 sm:py-5 lg:px-6 xl:px-7">
      <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col min-h-0">
        <AccountChart
          accounts={accounts}
          transactions={demoTransactions}
          referenceDate={DEMO_REFERENCE_DATE.toISOString()}
        />
      </div>
    </div>
  );
}
