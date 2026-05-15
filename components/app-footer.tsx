"use client";

import { usePathname } from "next/navigation";

export default function AppFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-violet-100 bg-violet-50/70 py-12">
      <div className="container mx-auto text-center text-violet-950/60">
        <p>Made With 💜 by Debarghya Bandyopadhyay</p>
      </div>
    </footer>
  );
}
