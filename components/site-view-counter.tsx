"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

let viewCountRequest: Promise<number> | null = null;

function loadViewCount() {
  if (!viewCountRequest) {
    viewCountRequest = fetch("/api/views", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load site views");
        }

        const data = (await response.json()) as { views?: unknown };
        const views = Number(data.views);

        if (!Number.isFinite(views) || views < 0) {
          throw new Error("Invalid site view count");
        }

        return views;
      })
      .catch((error) => {
        viewCountRequest = null;
        throw error;
      });
  }

  return viewCountRequest;
}

export default function SiteViewCounter() {
  const [views, setViews] = useState<number | null>();

  useEffect(() => {
    let isActive = true;

    loadViewCount()
      .then((count) => {
        if (isActive) {
          setViews(count);
        }
      })
      .catch(() => {
        if (isActive) {
          setViews(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (views === null) {
    return null;
  }

  const formattedViews =
    views === undefined ? "..." : new Intl.NumberFormat("en-IN").format(views);

  return (
    <span
      aria-label={
        views === undefined
          ? "Loading total views"
          : `${formattedViews} total views`
      }
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50/90 px-2.5 text-xs font-semibold tabular-nums text-violet-700 shadow-[0_10px_24px_-18px_rgba(109,40,217,0.55)]"
      title={views === undefined ? "Total views" : `${formattedViews} total views`}
    >
      <Eye aria-hidden className="h-3.5 w-3.5" />
      <span aria-live="polite">{formattedViews}</span>
    </span>
  );
}
