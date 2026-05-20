import { checkUser } from "@/lib/checkUser";
import {
  getFinancialHealthSnapshot,
  getMaxScore,
  SCORE_ITEMS,
} from "@/lib/financial-health";

export async function GET() {
  const user = await checkUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getFinancialHealthSnapshot(user.id);

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
