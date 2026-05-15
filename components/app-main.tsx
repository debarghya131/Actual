"use client";

import { usePathname } from "next/navigation";

export default function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard");

  return (
    <main
      className={
        isDashboardRoute
          ? "h-[calc(100vh-4.5rem)] overflow-hidden"
          : "min-h-screen"
      }
    >
      {children}
    </main>
  );
}
