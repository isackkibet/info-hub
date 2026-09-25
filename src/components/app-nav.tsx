"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sihu/submit", label: "Submit Report" },
  { href: "/sihu/validator", label: "Validator Queue" },
  { href: "/sihu/my-reports", label: "My Reports" },
  { href: "/cfa/dashboard", label: "CFA Hub" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-forest-900/10 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-700 text-sm font-semibold text-sand-50">
            KN
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide text-ink-900">
              KAI NUVARI
            </span>
            <span className="text-xs text-ink-600">Info Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-md bg-forest-700 px-3 py-2 text-sm font-medium text-sand-50"
                    : "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="rounded-md border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-forest-700/40 hover:text-forest-700"
        >
          Back to overview
        </Link>
      </div>
    </header>
  );
}
