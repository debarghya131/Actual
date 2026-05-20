"use client";

import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ScorePart = {
  key: string;
  label: string;
  description: string;
  value: number;
  max: number;
};

type FinancialHealthResponse = {
  score: number | null;
  isReady: boolean;
  status: {
    label: string;
    className: string;
  };
  parts: ScorePart[];
};

export default function FinancialHealthNavScore() {
  const [data, setData] = useState<FinancialHealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadScore() {
      try {
        const response = await fetch("/api/financial-health", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as FinancialHealthResponse;

        if (!cancelled) {
          setData(payload);
        }
      } catch (error) {
        console.error("Failed to load financial health score:", error);
      }
    }

    loadScore();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="inline-flex h-10 min-w-20 items-center justify-center rounded-md border border-violet-100 bg-white px-3 text-sm font-medium text-violet-700 sm:min-w-24 sm:px-4">
        <HeartPulse className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
        ...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 text-sm font-medium text-violet-900 transition hover:border-violet-300 hover:bg-violet-100/70 sm:gap-2 sm:px-4"
          >
            <HeartPulse className="h-4 w-4 shrink-0" />
            <span>{data.isReady ? data.score : "--"}</span>
            <span className="text-violet-950/50">/100</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={12} className="max-w-[calc(100vw-2rem)] rounded-3xl p-0">
          <div className="w-[min(320px,calc(100vw-2rem))] rounded-[24px] border border-violet-200/70 bg-white p-5 text-center shadow-[0_22px_60px_-34px_rgba(91,33,182,0.24)] sm:p-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <HeartPulse className="h-7 w-7" />
            </div>
            <p className="mt-5 text-sm font-medium text-violet-700">
              Current Score
            </p>
            <div className="mt-4 flex items-end justify-center gap-2">
              <span className="text-6xl font-semibold tracking-tight text-slate-950">
                {data.isReady ? data.score : "--"}
              </span>
              <span className="pb-2 text-lg font-medium text-violet-950/55">
                /100
              </span>
            </div>
            <p className={`mt-4 text-xl font-semibold ${data.status.className}`}>
              {data.status.label}
            </p>
            <p className="mt-3 text-sm text-violet-950/60">
              {data.isReady
                ? "Hover to see how this score is calculated."
                : "Add a few completed transactions to unlock your score."}
            </p>

            <div className="mt-6 space-y-3 rounded-2xl bg-violet-50/70 p-4 text-left">
              {data.isReady ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-950">
                      Score calculation
                    </p>
                    <p className="text-xs text-violet-950/65">
                      Total score is the sum of these weighted parts:
                    </p>
                  </div>

                  {data.parts.map((part) => (
                    <div key={part.key}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-950">
                            {part.label}
                          </p>
                          <p className="text-xs text-violet-950/65">
                            {part.description}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs font-semibold text-violet-900">
                          {part.value}/{part.max}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-950">
                    Score unavailable for now
                  </p>
                  <p className="text-xs leading-5 text-violet-950/65">
                    We need some completed monthly activity before Kubera can
                    judge savings, spending control, recurring pressure, and
                    balance coverage fairly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
