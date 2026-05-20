import { auth } from "@clerk/nextjs/server";

import { seedTransactions } from "@/app/actions/seed";

export async function GET(request: Request) {
  const configuredToken = process.env.SEED_ROUTE_TOKEN;
  const requestUrl = new URL(request.url);
  const requestToken = requestUrl.searchParams.get("token");
  const hasValidToken =
    Boolean(configuredToken) && requestToken === configuredToken;
  const isLocalDevRequest =
    process.env.NODE_ENV === "development" &&
    ["localhost", "127.0.0.1"].includes(requestUrl.hostname);
  const { userId } = await auth();

  // Never expose destructive seeding outside local development unless explicitly tokenized.
  if (!hasValidToken && !isLocalDevRequest) {
    return new Response("Not found", { status: 404 });
  }

  if (!userId && !hasValidToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await seedTransactions();
  return Response.json(result);
}
