"use client";

import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";

export default function Hero() {
  return (
    <LazyMotion features={domAnimation}>
    <m.section
      className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 md:py-16 lg:min-h-[min(760px,calc(100vh-4.5rem))] lg:px-8 lg:py-18 xl:py-20"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:gap-14">
      <m.div
        className="max-w-4xl"
        variants={{
          hidden: { opacity: 0, y: 18 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <m.p
          className="mb-4 text-xs font-semibold tracking-[0.16em] text-violet-600 uppercase sm:text-sm sm:tracking-[0.22em]"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Smarter personal finance
        </m.p>
        <m.h1
          className="hero-text-shimmer max-w-3xl text-[clamp(2.25rem,10.8vw,3.75rem)] font-semibold leading-[1.08] sm:text-[clamp(3.25rem,8vw,4rem)] lg:text-[clamp(3.5rem,5vw,4.5rem)] lg:leading-tight"
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className="hero-stat-glow text-emerald-500">82%</span> of people don&apos;t know
          where their money goes.
        </m.h1>
        <m.p
          className="hero-copy-glow mt-5 max-w-2xl text-base leading-7 text-violet-950/65 sm:mt-6 sm:text-lg sm:leading-8"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className="font-semibold text-emerald-600">Actual</span> fixes
          that. We turn your income, expenses, and goals into a smart financial
          plan powered by AI, made for real life.
        </m.p>
        <m.div
          className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center sm:mt-10 sm:gap-4"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <a
            href="/demo/dashboard"
            className="gradient-glow-button inline-flex min-h-12 w-full items-center justify-center rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 min-[420px]:w-auto"
          >
            Try Demo
          </a>
          <a
            href="#features"
            className="gradient-glow-button inline-flex min-h-12 w-full items-center justify-center rounded-full border border-violet-200 bg-white/90 px-6 py-3 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-900 min-[420px]:w-auto"
          >
            Explore Features
          </a>
        </m.div>
      </m.div>
      <m.div
        className="flex justify-center lg:justify-end"
        variants={{
          hidden: { opacity: 0, scale: 0.96, y: 18 },
          visible: { opacity: 1, scale: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative flex flex-col items-center [animation:kuberaFloat_4.8s_ease-in-out_infinite]">
          <div className="absolute inset-x-6 top-10 h-32 rounded-full bg-amber-300/25 blur-3xl sm:h-44" />
          <Image
            src="/kuberlogo.png?v=20260519"
            alt="Kubera logo"
            width={280}
            height={280}
            unoptimized
            priority
            sizes="(min-width: 1024px) 288px, (min-width: 640px) 256px, 192px"
            className="relative h-44 w-44 object-contain drop-shadow-[0_30px_45px_rgba(109,40,217,0.22)] min-[380px]:h-48 min-[380px]:w-48 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
          />
          <p className="relative mt-4 max-w-[min(18rem,100%)] rounded-full border border-violet-200 bg-white/85 px-5 py-3 text-center text-sm font-semibold text-violet-900 shadow-[0_18px_50px_-30px_rgba(91,33,182,0.42)] backdrop-blur sm:mt-5">
            Don&apos;t worry, I am always with you.
          </p>
        </div>
      </m.div>
      </div>
    </m.section>
    </LazyMotion>
  );
}
