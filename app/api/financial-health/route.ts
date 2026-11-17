import { checkUser } from "@/lib/checkUser";
import {
  calculateFinancialHealthSnapshot,
  getFinancialHealthSnapshot,
  getMaxScore,
  SCORE_ITEMS,
} from "@/lib/financial-health";
import {
  DEMO_REFERENCE_DATE,
  demoAccounts,
  demoBudget,
  getDemoTransactions,
} from "@/lib/demo-data";

export async function GET(request: Request) {
  const isDemoRequest = new URL(request.url).searchParams.get("demo") === "1";
  let snapshot;

  if (isDemoRequest) {
    snapshot = calculateFinancialHealthSnapshot({
      balances: demoAccounts.map((account) => account.balance),
      transactions: getDemoTransactions().map((transaction) => ({
        type: transaction.type,
        amount: transaction.amount,
        isRecurring: transaction.isRecurring,
        date: transaction.date,
      })),
      budgetAmount: demoBudget.amount,
      referenceDate: DEMO_REFERENCE_DATE,
    });
  } else {
    const user = await checkUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    snapshot = await getFinancialHealthSnapshot(user.id);
  }

  return Response.json({
    score: snapshot.score,
    isReady: snapshot.isReady,
    status: snapshot.status,
    parts: SCORE_ITEMS.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description,
      value: Math.round(snapshot.scoreParts[item.key]),
      max: getMaxScore(item.key),
    })),
  });
}
