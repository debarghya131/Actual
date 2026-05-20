import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="max-w-4xl">
        <p className="mb-4 text-sm font-semibold tracking-[0.22em] text-violet-600 uppercase">
          Smarter personal finance
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
          <span className="text-emerald-500">82%</span> of people don&apos;t know
          where their money goes.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-violet-950/65">
          <span className="font-semibold text-emerald-600">Actual</span> fixes
          that. We turn your income, expenses, and goals into a smart financial
          plan powered by AI, made for real life.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="/demo/dashboard"
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
      <div className="flex justify-center lg:justify-end">
        <div className="relative flex flex-col items-center [animation:kuberaFloat_4.8s_ease-in-out_infinite]">
          <div className="absolute inset-x-6 top-10 h-44 rounded-full bg-amber-300/25 blur-3xl" />
          <Image
            src="/kuberlogo.png?v=20260519"
            alt="Kubera logo"
            width={280}
            height={280}
            unoptimized
            priority
            sizes="(min-width: 1024px) 280px, 220px"
            className="relative h-56 w-56 object-contain drop-shadow-[0_30px_45px_rgba(109,40,217,0.22)] sm:h-64 sm:w-64 lg:h-72 lg:w-72"
          />
          <p className="relative mt-5 rounded-full border border-violet-200 bg-white/85 px-5 py-3 text-center text-sm font-semibold text-violet-900 shadow-[0_18px_50px_-30px_rgba(91,33,182,0.42)] backdrop-blur">
            Don&apos;t worry, I am always with you.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
