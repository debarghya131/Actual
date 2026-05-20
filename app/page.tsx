import AnalysisFeatureShowcase from "@/components/analysis-feature-showcase";
import AiFeatureShowcase from "@/components/ai-feature-showcase";
import BudgetFeatureShowcase from "@/components/budget-feature-showcase";
import Hero from "@/components/hero";
import OverviewFeatureShowcase from "@/components/overview-feature-showcase";
import ReportFeatureShowcase from "@/components/report-feature-showcase";
import TransactionFeatureShowcase from "@/components/transaction-feature-showcase";

export default function Home() {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(216,180,254,0.24),_transparent_26%),linear-gradient(180deg,_#fcfaff_0%,_#f7f1ff_52%,_#efe7ff_100%)]">
      <Hero />

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
          Features
        </h2>
        <OverviewFeatureShowcase />
        <TransactionFeatureShowcase />
        <BudgetFeatureShowcase />
        <ReportFeatureShowcase />
        <AnalysisFeatureShowcase />
        <AiFeatureShowcase />
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-700 uppercase">
            About
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Built for people who want sharper financial awareness without spreadsheet fatigue.
          </h2>
          <p className="mt-6 text-base leading-8 text-violet-950/65">
            Finance AI combines transaction management, budget planning, analytics, and machine-assisted recommendations in one responsive web app.
          </p>
        </div>
      </section>
    </div>
  );
}
