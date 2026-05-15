import type { ReactNode } from "react";

type DashboardPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function DashboardPageShell({
  eyebrow,
  title,
  description,
  children,
}: DashboardPageShellProps) {
  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-4 text-base leading-8 text-violet-950/65">{description}</p>
        </div>

        <div className="mt-8 rounded-[28px] border border-violet-100/90 bg-white/92 p-6 shadow-[0_22px_60px_-34px_rgba(91,33,182,0.18)] sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
