import { TransactionCreateScreen } from "@/app/(main)/transaction/_components/transaction-create-screen";

type DashboardTransactionCreatePageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export default function DashboardTransactionCreatePage({
  searchParams,
}: DashboardTransactionCreatePageProps) {
  return <TransactionCreateScreen searchParams={searchParams} />;
}
