import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <section className="bg-[linear-gradient(180deg,_#fcfaff_0%,_#f6f0ff_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl rounded-[28px] border border-violet-100 bg-white/85 p-8 shadow-[0_24px_80px_rgba(91,33,182,0.10)] backdrop-blur sm:p-12">
          <p className="text-sm font-semibold tracking-[0.28em] text-violet-600 uppercase">
            Page Not Found
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            We couldn&apos;t find the page you were looking for.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            The link may be outdated, the page may have moved, or the address might be off by a
            character or two.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 text-sm font-medium text-white transition hover:bg-violet-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Home
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-6 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
