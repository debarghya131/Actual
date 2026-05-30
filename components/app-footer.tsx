"use client";

import { Globe, Mail } from "lucide-react";
import type { JSXElementConstructor } from "react";
import { usePathname } from "next/navigation";

type SocialIcon = JSXElementConstructor<{ className?: string }>;

type SocialLink = {
  label: string;
  href: string;
  icon?: SocialIcon;
  iconText?: string;
};

const socialLinks: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/debarghya-bandyopadhyay-953b02400?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    iconText: "in",
  },
  {
    label: "X",
    href: "https://x.com/debarghya131",
    iconText: "X",
  },
  {
    label: "GitHub",
    href: "https://github.com/debarghya131",
    icon: GithubLogo,
  },
  {
    label: "Portfolio",
    href: "https://portfolio.debarghya.org",
    icon: Globe,
  },
  {
    label: "Email",
    href: "mailto:debarghyabandyopadhyay191@gmail.com",
    icon: Mail,
  },
];

function GithubLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.87-.39.97.01 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.16c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function AppFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/demo/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-violet-100 bg-violet-50/70 px-4 py-10 sm:px-6 sm:py-12">
      <div className="container mx-auto text-center text-violet-950/60">
        <p className="break-words text-sm leading-6 sm:text-base">
          Made With 💜 by Debarghya Bandyopadhyay
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {socialLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={link.label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-200 bg-white/80 text-violet-700 shadow-[0_12px_30px_-24px_rgba(91,33,182,0.55)] transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white hover:text-violet-950"
              >
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-bold">{link.iconText}</span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
