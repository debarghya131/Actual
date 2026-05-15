export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-4xl">
        <p className="mb-4 text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
          Smarter personal finance
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
          Track spending, spot patterns, and plan ahead with AI-backed clarity.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-violet-950/65">
          A clean personal finance workspace for transactions, budgets, insights, and forecasting built to make everyday money decisions feel less noisy.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#demo"
            className="rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Try Demo
          </a>
          <a
            href="#features"
            className="rounded-full border border-violet-200 bg-white/90 px-6 py-3 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-900"
          >
            Explore Features
          </a>
        </div>
      </div>
    </section>
  );
}
