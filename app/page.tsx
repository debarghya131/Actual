import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(216,180,254,0.24),_transparent_26%),linear-gradient(180deg,_#fcfaff_0%,_#f7f1ff_52%,_#efe7ff_100%)]">
      <Hero />

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Everything you need in one finance dashboard
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Transaction tracking", "Organize expenses, income, and categories without losing the full picture."],
            ["AI insights", "Get quick summaries of spending behavior, recurring patterns, and anomalies."],
            ["Budget planning", "Set realistic monthly limits and keep watch over every category in motion."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-violet-100/80 bg-white/80 p-6 shadow-[0_20px_60px_-30px_rgba(91,33,182,0.22)] backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-violet-950/65">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-violet-400/20 bg-[linear-gradient(145deg,_#2f0f55_0%,_#4c1d95_52%,_#6d28d9_100%)] p-8 text-white shadow-[0_30px_80px_-35px_rgba(76,29,149,0.65)] sm:p-12">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-200 uppercase">
            Try Demo
          </p>
          <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-3xl font-semibold leading-tight">
                See your budgets, cash flow, and AI summaries in one focused view.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-violet-100/80">
                The demo experience is designed to feel like a real working product, not a static marketing screen.
              </p>
            </div>
            <div className="grid gap-4 rounded-2xl bg-white/8 p-5">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs tracking-[0.18em] text-violet-100/70 uppercase">Monthly spend</p>
                <p className="mt-2 text-3xl font-semibold">₹2,480</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs tracking-[0.18em] text-violet-100/70 uppercase">AI note</p>
                <p className="mt-2 text-sm leading-7 text-violet-50/85">
                  Food delivery is up 18% this month while transport is down 11%.
                </p>
              </div>
            </div>
          </div>
        </div>
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
