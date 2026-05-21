"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { CreditCard, LayoutDashboard, Menu, X } from "lucide-react";

import { dashboardSidebarWidthClass } from "@/components/dashboard-sidebar";
import FinancialHealthNavScore from "@/components/financial-health-nav-score";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "/demo/dashboard", label: "Try Demo", featured: true },
  { href: "#about", label: "About" },
];

const dashboardQuickActions = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dashboard/transaction/create",
    label: "Add Transaction",
    icon: CreditCard,
    featured: true,
  },
];

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDashboardNav =
    pathname.startsWith("/dashboard") || pathname.startsWith("/demo/dashboard");
  const isDemoRoute = pathname.startsWith("/demo/dashboard");

  const signInButton = (
    <button className="h-10 cursor-pointer rounded-full border border-violet-200 bg-white/80 px-4 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:text-violet-900 sm:px-5">
      Login
    </button>
  );

  const signUpButton = (
    <button className="h-10 cursor-pointer rounded-full bg-violet-700 px-4 text-sm font-medium text-white transition hover:bg-violet-800 sm:px-5">
      Sign Up
    </button>
  );

  const signInLink = (
    <Link
      href="/sign-in"
      className="inline-flex h-10 items-center justify-center rounded-full border border-violet-200 bg-white/80 px-4 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:text-violet-900 sm:px-5"
    >
      Login
    </Link>
  );

  const signUpLink = (
    <Link
      href="/sign-up"
      className="inline-flex h-10 items-center justify-center rounded-full bg-violet-700 px-4 text-sm font-medium text-white transition hover:bg-violet-800 sm:px-5"
    >
      Sign Up
    </Link>
  );

  const userButtonFallback = (
    <div className="h-10 w-10 animate-pulse rounded-full bg-violet-100 ring-1 ring-violet-200" />
  );

  if (isDashboardNav) {
    return (
      <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/85 backdrop-blur-xl">
        <div className="flex h-18 w-full items-center">
          <div
            className={`hidden h-full shrink-0 border-r border-violet-100 px-5 lg:flex lg:items-center ${dashboardSidebarWidthClass}`}
          >
            <Link href="/" className="flex min-w-0 items-center">
              <div className="flex h-14 w-[152px] items-center overflow-hidden sm:w-[196px]">
                <Image
                  src="/logo.png"
                  alt="Finance AI logo"
                  width={1536}
                  height={1024}
                  className="h-auto w-[176px] max-w-none object-contain origin-left sm:w-[232px]"
                  priority
                  unoptimized
                />
              </div>
            </Link>
          </div>

          <div className="flex min-w-0 flex-1 items-center px-4 sm:px-6 lg:px-10">
            <Link href="/" className="flex min-w-0 items-center lg:hidden">
              <div className="flex h-14 w-[152px] items-center overflow-hidden sm:w-[196px]">
                <Image
                  src="/logo.png"
                  alt="Finance AI logo"
                  width={1536}
                  height={1024}
                  className="h-auto w-[176px] max-w-none object-contain origin-left sm:w-[232px]"
                  priority
                  unoptimized
                />
              </div>
            </Link>

            {isDemoRoute ? (
              <div className="ml-auto mr-4 hidden items-center gap-3 sm:flex">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Demo Mode
                </span>
                <Link
                  href="/sign-in"
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <nav className="ml-auto mr-3 hidden items-center gap-2 sm:flex">
                <FinancialHealthNavScore />
              </nav>
            )}

            {!isDemoRoute ? (
              <div className="ml-auto flex shrink-0 items-center sm:ml-0">
                <ClerkLoading>{userButtonFallback}</ClerkLoading>
                <ClerkLoaded>
                  <UserButton />
                </ClerkLoaded>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/70 backdrop-blur-xl">
      <div className="flex min-h-18 w-full items-center gap-3 px-3 min-[380px]:px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center">
          <div className="flex h-16 w-[min(42vw,138px)] items-center overflow-hidden sm:w-[222px]">
            <Image
              src="/logo.png"
              alt="Finance AI logo"
              width={1536}
              height={1024}
              className="h-auto w-[min(50vw,162px)] max-w-none object-contain origin-left sm:w-[262px]"
              priority
              unoptimized
            />
          </div>
        </Link>

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-white/85 text-violet-800 shadow-[0_12px_28px_-22px_rgba(109,40,217,0.35)] transition hover:border-violet-200 hover:bg-violet-50 md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <ClerkLoading>
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.featured
                    ? "rounded-full bg-violet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-800"
                    : "text-sm font-medium text-violet-700/80 transition hover:text-violet-900"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            {signInLink}
            {signUpLink}
          </div>
        </ClerkLoading>

        <ClerkLoaded>
          <Show when="signed-out">
            <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.featured
                      ? "rounded-full bg-violet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-800"
                      : "text-sm font-medium text-violet-700/80 transition hover:text-violet-900"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-3 md:flex">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                {signInButton}
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                {signUpButton}
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.featured
                      ? "rounded-full bg-violet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-800"
                      : "text-sm font-medium text-violet-700/80 transition hover:text-violet-900"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-3 md:flex">
              <nav className="hidden items-center gap-3 md:flex">
                {dashboardQuickActions.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        item.featured
                          ? "inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-900"
                          : isActive
                            ? "inline-flex h-10 items-center gap-2 rounded-md border border-violet-200 bg-white px-4 text-sm font-medium text-slate-950 shadow-sm"
                            : "inline-flex h-10 items-center gap-2 rounded-md border border-violet-100 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <ClerkLoading>{userButtonFallback}</ClerkLoading>
              <ClerkLoaded>
                <UserButton />
              </ClerkLoaded>
            </div>
          </Show>
        </ClerkLoaded>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-violet-100 bg-white/92 px-3 py-4 shadow-[0_18px_42px_-30px_rgba(91,33,182,0.28)] min-[380px]:px-4 md:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  item.featured
                    ? "gradient-glow-button flex min-h-12 items-center justify-center rounded-full bg-violet-700 px-4 text-sm font-semibold text-white"
                    : "flex min-h-12 items-center justify-center rounded-full border border-violet-100 bg-white text-sm font-semibold text-violet-800 transition hover:border-violet-200 hover:bg-violet-50"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Show when="signed-out">
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                <button className="min-h-12 cursor-pointer rounded-full border border-violet-200 bg-white/90 px-4 text-sm font-semibold text-violet-700">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                <button className="gradient-glow-button min-h-12 cursor-pointer rounded-full bg-violet-700 px-4 text-sm font-semibold text-white">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="mt-3 grid gap-2">
              {dashboardQuickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-violet-100 bg-white text-sm font-semibold text-violet-800"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </Show>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
