"use client";

import { usePathname } from "next/navigation";

export default function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/demo/dashboard");

  return (
    <main
      className={
        isDashboardRoute
          ? "min-h-[calc(100svh-4.5rem)] lg:h-[calc(100dvh-4.5rem)] lg:overflow-hidden"
          : "min-h-screen"
      }
    >
      {children}
    </main>
  );
}
