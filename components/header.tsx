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

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Try Demo", featured: true },
  { href: "#about", label: "About" },
];

const dashboardNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Add Transaction" },
  { href: "/dashboard/budgets", label: "Budget" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/ai-insights", label: "AI Insights" },
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
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <nav className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {dashboardNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "rounded-full bg-violet-700 px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
                      : "rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-violet-700/80 transition hover:bg-violet-50 hover:text-violet-900"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0">
            <ClerkLoading>{userButtonFallback}</ClerkLoading>
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
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
          <Show when="signed-out">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
              {signInButton}
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
              {signUpButton}
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <ClerkLoading>{userButtonFallback}</ClerkLoading>
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </Show>
        </div>
      </div>
    </header>
  );
};

export default Header;
