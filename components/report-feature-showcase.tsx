"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  FeatureDetailMotion,
  FeatureShowcaseMotion,
} from "@/components/feature-showcase-motion";
import { cn } from "@/lib/utils";

const reportSlides = [
  {
    image: "/report/report1.webp",
    title: "Monthly Reports Dashboard",
    description:
      "Review past months with income, expenses, net savings, category breakdowns, transaction counts, and a monthly Kubera takeaway.",
  },
  {
    image: "/report/report2.png",
    title: "Kubera AI Summary",
    description:
      "Turn monthly numbers into a short financial summary that highlights surplus, biggest expense category, and tracked transaction volume.",
  },
  {
    image: "/report/report3.webp",
    title: "Monthly Report Email",
    description:
      "Send an automatic monthly email with total income, expenses, available balance, savings rate, top categories, and practical insights.",
  },
];

export default function ReportFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = reportSlides[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? reportSlides.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === reportSlides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <FeatureShowcaseMotion className="mt-14 grid min-w-0 items-start gap-6 sm:mt-16 sm:gap-8 lg:mt-20 lg:grid-cols-[minmax(18rem,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-10 xl:gap-12">
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase sm:text-sm sm:tracking-[0.22em]">
          Reports
        </p>
        <h3 className="mt-3 text-[clamp(1.45rem,6vw,1.875rem)] font-semibold leading-tight text-slate-950">
          {activeSlide.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-violet-950/65 sm:mt-5 sm:leading-8">
          {activeSlide.description}
        </p>
        <div className="mt-6 grid gap-2.5 sm:mt-7 sm:gap-3">
          {reportSlides.map((slide, index) => (
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
            aria-label="Show previous report image"
            onClick={showPrevious}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white/90 text-violet-700 shadow-[0_14px_30px_-20px_rgba(91,33,182,0.45)] transition hover:border-violet-300 hover:bg-violet-50 sm:left-4 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Show next report image"
            onClick={showNext}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white/90 text-violet-700 shadow-[0_14px_30px_-20px_rgba(91,33,182,0.45)] transition hover:border-violet-300 hover:bg-violet-50 sm:right-4 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-4">
          {reportSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Show report image ${index + 1}`}
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
    </FeatureShowcaseMotion>
  );
}
