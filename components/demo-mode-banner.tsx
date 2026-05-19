"use client";

import Link from "next/link";

type DemoModeBannerProps = {
  className?: string;
};

export default function DemoModeBanner({ className }: DemoModeBannerProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
          Demo Mode
        </p>
        <p className="mt-1 text-sm text-amber-900/80">
          Explore the product with prebuilt sample data. Saving, editing, and submitting are disabled.
        </p>
      </div>
      <Link
        href="/sign-in"
        className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-900"
      >
        Sign In To Use Real Features
      </Link>
    </div>
  );
}
