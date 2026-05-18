import { notFound, redirect } from "next/navigation";

import { checkUser } from "@/lib/checkUser";
import { formatCurrency } from "@/lib/currency";
import { db } from "@/lib/prisma";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const account = await db.account.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) {
    notFound();
  }

  return (
    <section className="w-full px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-5xl font-semibold leading-none tracking-tight text-indigo-600">
              {account.name}
            </h1>
            <p className="mt-2 text-xs text-zinc-500">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
            </p>
          </div>

          <div className="pt-5 text-right">
            <p className="text-lg font-semibold leading-none text-zinc-950">
              {formatCurrency(account.balance)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              {account._count.transactions} Transactions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
