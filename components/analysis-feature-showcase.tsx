"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const analysisSlides = [
  {
    image: "/analysis/analysis1.png",
    title: "Transaction Overview Chart",
    description:
      "Compare income and expenses across time with account filters, range filters, totals, and daily bars for quick trend spotting.",
  },
  {
    image: "/analysis/analysis2.png",
    title: "Flexible Date Range",
    description:
      "Switch between recent windows like the last 7 days, last month, last 3 months, last 6 months, or all-time analysis.",
  },
  {
    image: "/analysis/analysis3.png",
    title: "Income Category Analysis",
    description:
      "Break down income by category with a donut chart, total income, categories used, and ranked category contribution bars.",
  },
  {
    image: "/analysis/analysis4.png",
    title: "Expense Category Analysis",
    description:
      "See which spending categories take the biggest share of expenses, with category totals and percentage contribution for each group.",
  },
];

export default function AnalysisFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = analysisSlides[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? analysisSlides.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === analysisSlides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="mt-20 grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <div className="rounded-3xl border border-violet-100/80 bg-white/88 p-4 shadow-[0_26px_70px_-42px_rgba(91,33,182,0.38)] backdrop-blur">
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,_rgba(250,245,255,0.92),_rgba(255,255,255,0.98))] p-5">
          <Image
            key={activeSlide.image}
            src={activeSlide.image}
            alt={activeSlide.title}
            width={1200}
            height={720}
            unoptimized
            className="max-h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(91,33,182,0.16)]"
            sizes="(min-width: 1024px) 680px, 100vw"
          />

          <button
            type="button"
            aria-label="Show previous analytics image"
            onClick={showPrevious}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white/90 text-violet-700 shadow-[0_14px_30px_-20px_rgba(91,33,182,0.45)] transition hover:border-violet-300 hover:bg-violet-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Show next analytics image"
            onClick={showNext}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white/90 text-violet-700 shadow-[0_14px_30px_-20px_rgba(91,33,182,0.45)] transition hover:border-violet-300 hover:bg-violet-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {analysisSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Show analytics image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2.5 rounded-full transition",
                index === activeIndex
                  ? "w-8 bg-violet-700"
                  : "w-2.5 bg-violet-200 hover:bg-violet-300"
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold tracking-[0.22em] text-emerald-600 uppercase">
          Analytics
        </p>
        <h3 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
          {activeSlide.title}
        </h3>
        <p className="mt-5 text-base leading-8 text-violet-950/65">
          {activeSlide.description}
        </p>
        <div className="mt-7 grid gap-3">
          {analysisSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                index === activeIndex
                  ? "border-violet-300 bg-white text-violet-950 shadow-[0_16px_40px_-30px_rgba(91,33,182,0.36)]"
                  : "border-violet-100 bg-white/55 text-violet-950/62 hover:border-violet-200 hover:bg-white/80"
              )}
            >
              {slide.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
