"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  FeatureDetailMotion,
  FeatureShowcaseMotion,
} from "@/components/feature-showcase-motion";
import { cn } from "@/lib/utils";

const budgetSlides = [
  {
    image: "/budget/budget1.png",
    title: "Budget Planning Workspace",
    description:
      "Manage total monthly budget, category caps, and savings goals together so spending limits and targets stay visible in one place.",
  },
  {
    image: "/budget/budget2.png",
    title: "Six Month Budget Plan",
    description:
      "Edit rolling monthly budget amounts for the current month and upcoming months, then save the plan when the numbers feel right.",
  },
  {
    image: "/budget/budget3.png",
    title: "Category Budget Caps",
    description:
      "Set category-level limits for housing, education, travel, groceries, utilities, and transportation based on real spending patterns.",
  },
  {
    image: "/budget/budget4.png",
    title: "Savings Goal Planner",
    description:
      "Plan monthly savings targets ahead of time and keep each future month ready with its own goal amount.",
  },
  {
    image: "/budget/budget5.png",
    title: "Monthly Budget Warning",
    description:
      "Show when total spending has crossed the monthly budget, with a clear progress bar and overspent percentage.",
  },
  {
    image: "/budget/budget6.png",
    title: "Goal Progress",
    description:
      "Track current month savings against the goal, including saved amount, remaining amount, and completion percentage.",
  },
  {
    image: "/budget/budget7.png",
    title: "Expense Breakdown",
    description:
      "Compare category spending against targets with color-coded bars that highlight used, near-limit, and overspent categories.",
  },
  {
    image: "/budget/budget8.png",
    title: "Month Selector",
    description:
      "Switch between current and future months to review or adjust category budgets across the planning timeline.",
  },
  {
    image: "/budget/budget9.png",
    title: "Budget Alert Email",
    description:
      "Send a budget alert email when spending reaches a warning threshold, showing the budget amount, spent so far, and remaining balance.",
  },
];

export default function BudgetFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = budgetSlides[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? budgetSlides.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === budgetSlides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <FeatureShowcaseMotion className="mt-14 grid min-w-0 items-start gap-6 sm:mt-16 sm:gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] lg:items-center lg:gap-10 xl:gap-12">
      <div className="feature-showcase-card min-w-0 rounded-2xl border border-violet-100/80 bg-white/88 p-2 shadow-[0_26px_70px_-42px_rgba(91,33,182,0.38)] backdrop-blur sm:rounded-3xl sm:p-4">
        <div className="relative flex aspect-[1.08/1] items-center justify-center overflow-hidden rounded-xl border border-violet-100 bg-[linear-gradient(135deg,_rgba(250,245,255,0.92),_rgba(255,255,255,0.98))] p-2 min-[420px]:aspect-[4/3] sm:aspect-[16/10] sm:rounded-2xl sm:p-5">
          <Image
            key={activeSlide.image}
            src={activeSlide.image}
            alt={activeSlide.title}
            width={1200}
            height={720}
            unoptimized
            className="max-h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(91,33,182,0.16)] animate-[featureImageIn_0.34s_ease-out]"
            sizes="(min-width: 1280px) 680px, (min-width: 1024px) 58vw, calc(100vw - 2rem)"
          />

          <button
            type="button"
            aria-label="Show previous budget image"
            onClick={showPrevious}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white/90 text-violet-700 shadow-[0_14px_30px_-20px_rgba(91,33,182,0.45)] transition hover:border-violet-300 hover:bg-violet-50 sm:left-4 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Show next budget image"
            onClick={showNext}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white/90 text-violet-700 shadow-[0_14px_30px_-20px_rgba(91,33,182,0.45)] transition hover:border-violet-300 hover:bg-violet-50 sm:right-4 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-4">
          {budgetSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Show budget image ${index + 1}`}
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

      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase sm:text-sm sm:tracking-[0.22em]">
          Budget Planning
        </p>
        <h3 className="mt-3 text-[clamp(1.45rem,6vw,1.875rem)] font-semibold leading-tight text-slate-950">
          {activeSlide.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-violet-950/65 sm:mt-5 sm:leading-8">
          {activeSlide.description}
        </p>
        <div className="mt-6 grid gap-2.5 sm:mt-7 sm:gap-3">
          {budgetSlides.map((slide, index) => (
            <FeatureDetailMotion key={slide.title} delay={index * 0.035}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "min-h-12 w-full rounded-xl border px-4 py-3 text-left text-sm leading-5 transition hover:-translate-y-0.5 sm:rounded-2xl",
                index === activeIndex
                  ? "active-section-glow border-violet-300 bg-white text-violet-950 shadow-[0_16px_40px_-30px_rgba(91,33,182,0.36)]"
                  : "border-violet-100 bg-white/55 text-violet-950/62 hover:border-violet-200 hover:bg-white/80"
              )}
            >
              {slide.title}
            </button>
            </FeatureDetailMotion>
          ))}
        </div>
      </div>
    </FeatureShowcaseMotion>
  );
}
