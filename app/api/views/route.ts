import { cookies } from "next/headers";

import { db } from "@/lib/prisma";

const VIEW_COOKIE = "actual_view_counted";
const VIEW_COOKIE_MAX_AGE = 60 * 60 * 24;
const VIEW_METRIC_KEY = "site_views";

export async function POST() {
  const cookieStore = await cookies();
  const hasRecentView = cookieStore.has(VIEW_COOKIE);

  const metric = await db.siteMetric.upsert({
    where: { key: VIEW_METRIC_KEY },
    update: hasRecentView
      ? {}
      : {
          value: {
            increment: 1,
          },
        },
    create: {
      key: VIEW_METRIC_KEY,
      value: 1,
    },
  });

  if (!hasRecentView) {
    cookieStore.set(VIEW_COOKIE, "1", {
      httpOnly: true,
      maxAge: VIEW_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return Response.json(
    { views: metric.value },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
