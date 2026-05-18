import { redirect } from "next/navigation";

type TransactionCreatePageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export default async function TransactionCreatePage({
  searchParams,
}: TransactionCreatePageProps) {
  const { edit } = await searchParams;
  const suffix = edit ? `?edit=${encodeURIComponent(edit)}` : "";

  redirect(`/dashboard/transaction/create${suffix}`);
}
