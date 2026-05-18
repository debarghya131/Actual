"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { CreditCard, HeartPulse, LayoutDashboard } from "lucide-react";

import { dashboardSidebarWidthClass } from "@/components/dashboard-sidebar";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Try Demo", featured: true },
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

const dashboardTopNavItems = [
  {
    href: "/dashboard/financial-health",
    label: "Financial Health Score",
    icon: HeartPulse,
  },
];

const Header = () => {
  const pathname = usePathname();
  const isDashboardNav = pathname.startsWith("/dashboard");

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

            <nav className="ml-auto mr-4 hidden items-center gap-2 sm:flex">
              {dashboardTopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive
                        ? "inline-flex h-10 items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 text-sm font-medium text-violet-900"
                        : "inline-flex h-10 items-center gap-2 rounded-md border border-violet-100 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-900"
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center">
              <ClerkLoading>{userButtonFallback}</ClerkLoading>
              <ClerkLoaded>
                <UserButton />
              </ClerkLoaded>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/70 backdrop-blur-xl">
      <div className="flex h-18 w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center">
          <div className="flex h-16 w-[168px] items-center overflow-hidden sm:w-[222px]">
            <Image
              src="/logo.png"
              alt="Finance AI logo"
              width={1536}
              height={1024}
              className="h-auto w-[194px] max-w-none object-contain origin-left sm:w-[262px]"
              priority
              unoptimized
            />
          </div>
        </Link>

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

          <div className="ml-auto flex items-center gap-3">
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

          <div className="ml-auto flex items-center gap-3">
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
      </div>
    </header>
  );
};

export default Header;
