import AnalysisFeatureShowcase from "@/components/analysis-feature-showcase";
import AiFeatureShowcase from "@/components/ai-feature-showcase";
import BudgetFeatureShowcase from "@/components/budget-feature-showcase";
import Hero from "@/components/hero";
import LandingPageTransition from "@/components/landing-page-transition";
import { LandingSectionMotion } from "@/components/landing-section-motion";
import OverviewFeatureShowcase from "@/components/overview-feature-showcase";
import ReportFeatureShowcase from "@/components/report-feature-showcase";
import TransactionFeatureShowcase from "@/components/transaction-feature-showcase";
import { Globe, Mail } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(216,180,254,0.24),_transparent_26%),linear-gradient(180deg,_#fcfaff_0%,_#f7f1ff_52%,_#efe7ff_100%)]">
      <LandingPageTransition>
      <Hero />

      <section
        id="features"
        className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <h2 className="text-xs font-semibold tracking-[0.18em] text-violet-600 uppercase sm:text-sm sm:tracking-[0.22em]">
          Features
        </h2>
        <OverviewFeatureShowcase />
        <TransactionFeatureShowcase />
        <BudgetFeatureShowcase />
        <ReportFeatureShowcase />
        <AnalysisFeatureShowcase />
        <AiFeatureShowcase />
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <LandingSectionMotion>
        <div className="feature-showcase-card overflow-hidden rounded-2xl border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,_rgba(217,163,59,0.14),_transparent_34%),linear-gradient(135deg,_#101521_0%,_#12101a_52%,_#150d1d_100%)] p-4 text-stone-100 shadow-[0_34px_90px_-48px_rgba(15,23,42,0.86)] sm:rounded-[2rem] sm:p-8 lg:p-10">
          <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(14rem,17.5rem)_minmax(0,1fr)] lg:gap-10">
            <div className="text-center">
              <div className="mx-auto flex aspect-square w-[min(68vw,11rem)] items-center justify-center rounded-full border border-amber-200/20 bg-stone-950/60 p-2 shadow-[0_0_0_8px_rgba(250,204,21,0.04),0_24px_70px_-36px_rgba(217,163,59,0.55)] sm:w-60 md:w-full md:max-w-60">
                <Image
                  src="/creator.webp"
                  alt="Debarghya Bandyopadhyay"
                  width={280}
                  height={340}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>

              <h2 className="mt-6 font-serif text-[clamp(1.45rem,8vw,1.65rem)] font-semibold uppercase leading-snug text-stone-50 sm:mt-7 sm:text-2xl">
                Debarghya
                <br />
                Bandyopadhyay
              </h2>
              <p className="mt-3 text-sm font-semibold text-amber-300/75">
                Creator of Actual
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.22em] text-amber-300/70 uppercase sm:tracking-[0.34em]">
                Creator Details
              </p>
              <p className="mt-4 max-w-4xl text-base leading-7 text-stone-200/86 sm:mt-5 sm:leading-8">
                Hi friends, I am Debarghya Bandyopadhyay, the creator of
                Actual. I love building modern web applications and SaaS
                products using AI-assisted workflows, rapid prototyping, and
                technologies like React.js, Next.js, Node.js, MongoDB,
                TypeScript, and Python. Actual is built from my interest in
                personal finance, practical web development, and tools that
                make everyday money decisions easier.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-7 md:grid-cols-2 md:gap-4">
                <div className="rounded-xl border border-stone-100/12 bg-white/5 p-4 sm:rounded-2xl sm:p-5">
                  <p className="text-xs font-semibold tracking-[0.2em] text-amber-300/70 uppercase sm:tracking-[0.28em]">
                    B.Tech
                  </p>
                  <p className="mt-4 text-sm font-semibold text-stone-50">
                    Netaji Subhas Engineering College, Kolkata
                  </p>
                </div>
                <div className="rounded-xl border border-stone-100/12 bg-white/5 p-4 sm:rounded-2xl sm:p-5">
                  <p className="text-xs font-semibold tracking-[0.2em] text-amber-300/70 uppercase sm:tracking-[0.28em]">
                    Diploma
                  </p>
                  <p className="mt-4 text-sm font-semibold text-stone-50">
                    Technique Polytechnic Institute, Hooghly
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-7">
                <h3 className="font-serif text-[clamp(1.45rem,7vw,2.15rem)] font-semibold leading-tight text-stone-50">
                  Be My Friend
                </h3>
                <p className="mt-3 max-w-2xl text-base leading-7 text-stone-200/82 sm:leading-8">
                  I always like to make new friends. Follow me on
                </p>
                <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-amber-300/70 uppercase sm:tracking-[0.28em]">
                  Connect On
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
                  <a
                    href="mailto:debarghyabandyopadhyay191@gmail.com"
                    aria-label="Email Debarghya Bandyopadhyay"
                    className="flex h-12 min-w-12 items-center justify-center rounded-full border border-stone-100/15 bg-white/6 px-4 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:bg-amber-300/10 hover:text-amber-200 sm:h-11 sm:min-w-11"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <a
                    href="https://x.com/debarghya131"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X profile"
                    className="flex h-12 min-w-12 items-center justify-center rounded-full border border-stone-100/15 bg-white/6 px-4 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:bg-amber-300/10 hover:text-amber-200 sm:h-11 sm:min-w-11"
                  >
                    X
                  </a>
                  <a
                    href="https://www.linkedin.com/in/debarghya-bandyopadhyay-953b02400"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn profile"
                    className="flex h-12 min-w-12 items-center justify-center rounded-full border border-stone-100/15 bg-white/6 px-4 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:bg-amber-300/10 hover:text-amber-200 sm:h-11 sm:min-w-11"
                  >
                    in
                  </a>
                  <a
                    href="https://github.com/debarghya131"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub profile"
                    className="flex h-12 min-w-12 items-center justify-center rounded-full border border-stone-100/15 bg-white/6 px-4 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:bg-amber-300/10 hover:text-amber-200 sm:h-11 sm:min-w-11"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.87-.39.97.01 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.16c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                    </svg>
                  </a>
                  <a
                    href="https://portfolio.debarghya.org"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-stone-100/15 bg-white/6 px-5 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:bg-amber-300/10 hover:text-amber-200 sm:h-11"
                  >
                    <Globe className="h-4 w-4" />
                    Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        </LandingSectionMotion>
      </section>

      <section className="mx-auto max-w-7xl overflow-hidden px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <LandingSectionMotion>
        <div className="feature-showcase-card overflow-hidden rounded-2xl border border-amber-300/15 bg-[radial-gradient(circle_at_top_right,_rgba(217,163,59,0.16),_transparent_32%),linear-gradient(135deg,_#171717_0%,_#11131d_54%,_#0f1020_100%)] p-4 text-stone-100 shadow-[0_34px_90px_-48px_rgba(15,23,42,0.86)] sm:rounded-[2rem] sm:p-8 lg:p-10">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)] lg:items-center lg:gap-10">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.22em] text-amber-300/70 uppercase sm:tracking-[0.34em]">
                Motivation
              </p>
              <h2 className="mt-4 font-serif text-[clamp(1.45rem,7vw,2.25rem)] font-semibold uppercase leading-tight text-stone-50 xl:text-4xl">
                Motivation for creating this project.
              </h2>
              <div className="mt-6 max-w-3xl space-y-4 text-base leading-7 text-stone-200/82 sm:mt-8 sm:space-y-5 sm:leading-8">
                <p>
                  The main motivation for this project comes from my personal
                  experience during my diploma college life. After moving away
                  from home and living in a hostel, I found it difficult to
                  manage my monthly expenses and savings. Although my father
                  regularly sent money for my education and living costs, I
                  often could not track where the money was being spent.
                </p>
                <p>
                  Managing expenses such as food, rent, travel, fees, and
                  emergencies became challenging alongside academic
                  responsibilities. I realized that many students face similar
                  issues due to a lack of budgeting and expense-tracking habits.
                </p>
                <p>
                  To address this problem, I developed an AI-Powered Personal
                  Finance Analytics System. The system helps users track
                  expenses, analyze spending patterns, manage budgets, and
                  receive smart financial insights, making personal finance
                  management simpler and more effective.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative flex aspect-square w-[min(68vw,14rem)] items-center justify-center rounded-full border border-amber-200/10 bg-stone-950/35 [animation:kuberaFloat_4.8s_ease-in-out_infinite] sm:w-64 lg:w-full lg:max-w-64">
                <div className="absolute h-[64%] w-[64%] rounded-full border border-amber-200/10" />
                <div className="absolute h-[44%] w-[44%] rounded-full border border-amber-200/15" />
                <Image
                  src="/kuberlogo.webp"
                  alt="Kubera finance guide"
                  width={160}
                  height={160}
                  className="relative h-[54%] w-[54%] object-contain drop-shadow-[0_22px_45px_rgba(217,163,59,0.34)]"
                />
              </div>
            </div>
          </div>
        </div>
        </LandingSectionMotion>
      </section>
      </LandingPageTransition>
    </div>
  );
}
