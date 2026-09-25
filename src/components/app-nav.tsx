"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/auth-actions";

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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-600 text-sm font-semibold text-white">
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
                    ? "rounded-md bg-forest-600 px-3 py-2 text-sm font-medium text-white"
                    : "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-700 sm:inline-block"
          >
            Back to overview
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
