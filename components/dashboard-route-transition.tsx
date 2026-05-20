"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";

type DashboardRouteTransitionProps = {
  children: ReactNode;
};

export default function DashboardRouteTransition({
  children,
}: DashboardRouteTransitionProps) {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-full"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
