const stats = [
  { label: "Monthly Spend", value: "$2,480", note: "12% below plan" },
  { label: "Saved This Month", value: "$820", note: "Goal on track" },
  { label: "AI Health Score", value: "84/100", note: "Strong cash discipline" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.22),_transparent_24%),linear-gradient(180deg,_#fcfaff_0%,_#f5efff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Your money overview at a glance
          </h1>
          <p className="mt-4 text-base leading-8 text-violet-950/65">
            Watch spending, budget progress, and AI-generated financial signals from one calm workspace.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-violet-100 bg-white/85 p-6 shadow-[0_20px_60px_-30px_rgba(91,33,182,0.22)]"
            >
              <p className="text-sm font-medium text-violet-700/80">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-violet-950/60">{stat.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
